'use strict';

var
mailer = require('../common/components/mailer');

[
  'queue-processing-start',
  'queue-before-send',
  'queue-error',
  'queue-after-send',
  'queue-processing-finish',
  'send-success',
  'error',
  'send-error-noretry',
  'send-error',
  'send-error-retry-failed',
  'send-error-retry',
  'queue-item-add',
  'queue-start',
  'queue-stop'
].forEach(function(evt) {
  mailer.on(evt, function () {
    console.log('Event (%s) %j', evt, Array.prototype.slice.call(arguments));
  });
});

mailer.queueStart().then(function () {
  setTimeout(function () {
    mailer.queue({
      to:      'kryo2k@gmail.com',
      subject: 'This is a test 1',
      text:    'testing1',
    }, {
      to:      'kryo2k@gmail.com',
      subject: 'This is a test 2',
      text:    'testing2',
    }/*, {
      to:      'kryo2k@gmail.com',
      subject: 'This is a test 3',
      text:    'testing3',
    }, {
      to:      'kryo2k@gmail.com',
      subject: 'This is a test 4',
      text:    'testing4',
    }, {
      to:      'kryo2k@gmail.com',
      subject: 'This is a test 5',
      text:    'testing5',
    }*/);
  }, 3000);

  // setTimeout(function () {
  //   mailer.queue({
  //     to:      'kryo2k@gmail.com',
  //     subject: 'This is a test 6',
  //     text:    'testing6',
  //   }, {
  //     to:      'kryo2k@gmail.com',
  //     subject: 'This is a test 7',
  //     text:    'testing7',
  //   }, {
  //     to:      'kryo2k@gmail.com',
  //     subject: 'This is a test 8',
  //     text:    'testing8',
  //   });
  // }, 10000);
});
