/**
 * Created by karankohli13 on 07/11/17.
 */
// var Mailgun = require('mailgun-js');
const nodemailer = require('nodemailer');
var path = require("path");
var EmailTemplate = require('email-templates').EmailTemplate;
var config = require('./../../config');

var sendMail = function(opts, cb) {

    var templateDir = path.join(__dirname, '../mailerTemplates', opts.type);
    var template = new EmailTemplate(templateDir);

    if (!cb) cb = konsole;

    template.render(opts)
        .then(function(results) {
            var MailData = {
                //Specify email data
                from: config.emailSender.sender,
                //The email to contact
                to: opts.email,
                //Subject and text data
                subject: 'Email Notification',
                html: results.html
            };

            config.emailSender.transporter.sendMail(MailData, (error, info) => {
                if (error)
                    return cb(error);
                if (cb)
                    return cb(null, info.response || {})
                else return;
            });

        });
};

var konsole = function(err, data) {
    if (err)
        console.log('err: ' + err);
    else console.log('data: ' + data);
};

module.exports = {
    send: sendMail
};