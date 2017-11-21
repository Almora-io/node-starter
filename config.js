
var path = require('path'),
    nodemailer = require('nodemailer'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';


var config = {
    development: {
        root: rootPath,
        app: {
            name: 'node-starter-dev',
            domain: 'http://localhost:3000',
            desktopApi: 'v1',
            mobileApi: 'v1'
        },
        port: process.env.PORT || 3000,
        db: 'mongodb://localhost/node-starter',
        redis: '',
        smsSender: {
            twilio: {
                accountSid: process.env.twilioAccountSid || '',
                authToken: process.env.twilioAuthToken || '',
                number: ''
            },
            msg91: {
                authkey: process.env.msg91Authkey || ''
            }
        },
        emailSender: {
            sender: 'youremail@email.com',
            transporter: nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'username',
                    pass: 'password'
                }
            })
        },
        recaptcha: {
            isEnabled: false,
            site_key: '',
            secret_key: ''
        }
    },

    test: {},

    production: {}
};


module.exports = config[env];