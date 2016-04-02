'use strict';

var
_ = require('lodash'),
format = require('util').format,
validator = require('validator'),
ValidationError = require('../../components/error-validation'),
recapchaValidator = require('../../components/recaptcha-verifier'),
InputError = require('../../components/error-input'),
mailer = require('../../components/mailer'),
config = require('../../../config');


exports.submit = function (req, res, next) {

  var
  cfg = config.contact||{},
  body = req.body,
  sendFrom = cfg.sendFrom,
  sendTo   = cfg.sendTo,
  sendSubject = cfg.subject;

  if(!_.isPlainObject(body)) {
    return next(new InputError('Invalid body was provided for contact.'));
  }

  if(!sendTo) {
    return next(new InputError('Contact is not enabled in this application.'));
  }

  var recaptcha = body.recaptcha;

  recapchaValidator.checkResponse(recaptcha, function (err, response) {

    if(err) {
      return next(err);
    }

    var
    name      = body.name,
    email     = body.email,
    subject   = body.subject,
    message   = body.message,
    errors    = [];

    if(!response.success) {
      errors.push({ path: 'recaptcha', value: recaptcha, message: 'Invalid recaptcha result was provided.' });
    }

    if(!_.isString(name) || !validator.isLength(name, { min: 1, max: 300 })) {
      errors.push({ path: 'name', value: name, message: 'The supplied name has an invalid length or is not present.' });
    }

    if(!_.isString(email) || !validator.isEmail(email)) {
      errors.push({ path: 'email', value: email, message: 'The supplied email is in invalid format.' });
    }

    if(_.isString(subject) && !validator.isLength(subject, { min: 0, max: 500 })) {
      errors.push({ path: 'subject', value: subject, message: 'The supplied subject has an invalid length. It must not exceed 500 characters.' });
    }
    else {
      subject = null;
    }

    if(!_.isString(message) || !validator.isLength(message, { min: 5, max: 5000 })) {
      errors.push({ path: 'message', value: message, message: 'The supplied message has an invalid length. It must be at least 5 and not exceed 5000 characters.' });
    }

    if(errors.length > 0) {
      return next(new ValidationError({ validationMessage: 'Could not send contact, please check the errors in the form.', errors: errors }));
    }

    var
    html = mailer.templates.contact({
      now: new Date(),
      body: body
    });

    sendSubject = sendSubject
      .replace('{name}',    name)
      .replace('{email}',   email)
      .replace('{subject}', subject)
      .replace('{message}', message.substring(0, 200));

    // queue the message for sending
    mailer.queue({ from: sendFrom, to: sendTo, subject: sendSubject, html: html })
      .spread(function (message) {

        // send the response thru
        res.respondOk({ message: 'Thank you for your message, we will respond as soon as possible.' });

      })
      .catch(next);
  });
};
