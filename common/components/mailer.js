'use strict';

var
_ = require('lodash'),
Q = require('q'),
EventEmitter = require('events'),
htmlToText = require('html-to-text'),
config = require('../../config/index');

var
proto = new EventEmitter(),
queueEnabled = false,
mailQueue = [], // this should be persistable, but for now, lets use memory.
loopInterval = 5000;

var
defaultHtmlTextOpts = {
  wordwrap: 130
},
defaultMailOpts = {
  from: config.mailer.fromSystem
  // from:          '',    // The sender of this email
  // to:            '',    // Comma separated list or an array of recipients e-mail addresses that will appear on the To: field
  // cc:            '',    // Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field
  // bcc:           '',    // Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field
  // subject:       '',    // The subject of the e-mail
  // text:          '',    // The plaintext version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: '/var/data/...'})
  // html:          '',    // The HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: 'http://...'})
  // attachments:   '',    // An array of attachment objects (see below for details)

  // advanced fields
  // sender:        '',    // An e-mail address that will appear on the Sender: field (always prefer from if you're not sure which one to use)
  // replyTo:       '',    // An e-mail address that will appear on the Reply-To: field
  // inReplyTo:     '',    // The message-id this message is replying to
  // references:    '',    // Message-id list (an array or space separated string)
  // watchHtml:     '',    // Apple Watch specific HTML version of the message. Same usage as with text or html
  // icalEvent:     '',    // iCalendar event to use as an alternative. Same usage as with text or html. Additionally you could set method property (defaults to 'PUBLISH'). See an example here
  // priority:      '',    // Sets message importance headers, either 'high', 'normal' (default) or 'low'.
  // headers:       '',    // An object or array of additional header fields (e.g. {"X-Key-Name": "key value"} or [{key: "X-Key-Name", value: "val1"}, {key: "X-Key-Name", value: "val2"}])
  // alternatives:  '',    // An array of alternative text contents (in addition to text and html parts) (see below for details)
  // envelope:      '',    // optional SMTP envelope, if auto generated envelope is not suitable (see below for details)
  // messageId:     '',    // optional Message-Id value, random value will be generated if not set
  // date:          '',    // optional Date value, current UTC string will be used if not set
  // encoding:      '',    // optional transfer encoding for the textual parts
  // raw:           '',    // existing MIME message to use instead of generating a new one. If this value is set then you should also set the envelope object (if required) as the provided raw message is not parsed. The value could be a string, a buffer, a stream or an attachment-like object.
  // textEncoding:  '',    // force content-transfer-encoding for text values (either quoted-printable or base64). By default the best option is detected (for lots of ascii use quoted-printable, otherwise base64)
  // list:          ''     // helper for setting List-* headers
},
transport = null,
queueTimeout = null,
maxRetry = 3,
queueTimeoutClr = function () {
  if(queueTimeout !== null) {
    clearTimeout(queueTimeout);
    queueTimeout = null;
  }
},
queueRequeue = function () {
  queueTimeout = setTimeout(queueLoop, loopInterval);
},
queueLoop = (function () {
  var emit = this.emit.bind(this);
  queueTimeoutClr(); // clear any existing timeout
  if(!queueEnabled) return;

  if(mailQueue.length > 0) {
    var // create a shallow copy and empty mailqueue array (incase others get added mid-process)
    totalItems = mailQueue.length,
    allItems = mailQueue.splice(0, totalItems),
    lastIndex = -1,
    stats = {
      sent: 0,
      skipped: 0,
      requeued: 0
    };

    emit('queue-processing-start', allItems);

    // process sends atomically
    return allItems.reduce((function (promise, spec, index) {
      return promise.then((function (results) {

        emit('queue-before-send', spec);

        return this.send(spec).then((function (result) {
          results.push(result);
          lastIndex = index;
          stats.sent++;
          return results;
        }).bind(this))
        .catch((function (err) {
          emit('queue-error', err);
          stats.skipped++;
          lastIndex = index;
          return results;
        }).bind(this))
        .finally(function () {
          emit('queue-after-send', spec);
        });
      }).bind(this));
    }).bind(this), Q.when([]))
    .catch(console.error.bind(console))
    .finally(function () { // push any remaining (unsuccessful and skipped emails) back into the queue

      if(lastIndex < (totalItems - 1)) {
        var requeue = allItems.slice(lastIndex);
        stats.requeue += requeue.length;
        Array.prototype.push.apply(mailQueue, requeue);
      }

      emit('queue-processing-finish', stats);

      queueRequeue();
    });
  }

  queueRequeue();
}).bind(proto),

verifyTransport = (function () {
  if(!config.mailer || !_.isObject(config.mailer.transport)) {
    return Q.resolve(false);
  }

  var t = config.mailer.transport;

  if(!_.isFunction(t.verify)) { // does not support a verify function
    return Q.reject(new Error('Invalid type of mail transporter is configured.'));
  }

  // --- this method is buggy ---
  // return t.verify().then(function (success) {
  //   if(success) {
  //     transport = t;
  //     return true;
  //   }

  //   return false;
  // });

   transport = t;

  return Q.resolve(true);
}).bind(proto);

//
// sends an email and returns a blocking promise
//
proto.send = function () {
  var
  emit = this.emit.bind(this),
  sendMail = transport.sendMail.bind(transport);

  if(!transport) {
    return Q.reject(new Error('Mail transport is not configured.'));
  }

  return Array.prototype.slice.apply(arguments)
    .reduce(function (promise, spec) {
      var cloneSpec = _.extend({}, spec); // nodemailer taints original object

      if(cloneSpec.html && !cloneSpec.hasOwnProperty('text')) {
        cloneSpec.text = proto.htmlToText(cloneSpec.html); // automatically include a text-only version if none provided.
      }

      return promise.then(function (results) {
        emit('before-send', cloneSpec);

        return Q.nfcall(sendMail, cloneSpec)
          .then(function (mailResult) {
            results.push(mailResult);
            emit('send-success', cloneSpec, mailResult);
            return results;
          })
          .catch(function (err) {
            emit('error', err);

            if(!err.retryable) {
              emit('send-error-noretry', cloneSpec, err);
              return Q.reject(err); // this breaks entire promise chain
            }

            var
            retryErrors = [],
            retryLoop = function (lastError) {
              emit('send-error', cloneSpec, err);
              var retryNum = retryErrors.length + 1;

              if(retryNum > maxRetry) {
                emit('send-error-retry-failed', cloneSpec, lastError, retryErrors);
                return Q.reject(new Error('Failed to send message after '+maxRetry+' retries.')); // this breaks entire promise chain
              }

              emit('send-error-retry', cloneSpec, lastError, retryNum, maxRetry);

              retryErrors.push(lastError);

              return Q.nfcall(sendMail, cloneSpec).catch(retryLoop);
            };

            return retryLoop(err);
          });
      });
    }, Q.when([]));
};

//
// queue an email for sending return a non-blocking promise.
// if queue is disabled, will return a blocking promise and sends email immediately.
//
proto.queue = function () {
  var emit = this.emit.bind(this);
  if(!queueEnabled) {
    return this.send.apply(this, arguments);
  }

  return Array.prototype.slice.apply(arguments)
    .reduce(function (promise, spec) {
      return promise.then(function (queueItems) {
        queueItems.push(_.merge({}, defaultMailOpts, spec));
        emit('queue-item-add', queueItems[queueItems.length - 1]);
        return queueItems;
      });
    }, Q.when([]))
    .then(function (queueItems) {
      Array.prototype.push.apply(mailQueue, queueItems);
      return queueItems;
    });
};

//
// Enables the queuing service
//
proto.queueStart = function () {
  return verifyTransport().then((function (success) {
    if(!success) {
      return Q.reject(new Error('Unable to start mailer queue, invalid transport detected.'));
    }

    this.emit('queue-start');
    queueEnabled = true;
    queueLoop(); // start queue loop
    return true;
  }).bind(this));
};

//
// Disables the queuing service
//
proto.queueStop = function () {

  if(mailQueue.length > 0) {
    console.warn('There are messages stuck in the mail queue:', mailQueue);
  }

  this.emit('queue-stop');
  queueTimeoutClr(); // clear any existing timeout
  queueEnabled = false;
  return this;
};

proto.htmlToText = function (html, opts) {
  return htmlToText.fromString(html, _.merge({}, defaultHtmlTextOpts, opts));
};

proto.templates = {
  forgotPassword: require('../../email/forgot-password'),
  contact:        require('../../email/contact')
};

module.exports = proto;
