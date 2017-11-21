/**
 * Created by karankohli13 on 06/11/17.
 */
var jsonwebtoken = require('jsonwebtoken'),
    userSchema = require('./../models/user'),
    config = require('./../../config'),
    status = require('http-status-codes'),
    handler = require('./handler'),
    moment = require('moment'),
    env = process.env.NODE_ENV || 'development',
    date = require('./datesHelper'),
    preset = require('./../preset'),
    crypto = require('crypto-js/aes'),
    CryptoJS = require("crypto-js"),
    Recaptcha = require('express-recaptcha');
// recaptcha = new Recaptcha(config.recaptcha.site_key, config.recaptcha.secret_key);


moment.locale('in');

var regex = {
    /* ToDo Identify phone numbers more precisely */
    phoneRegex: /^\+(?:[0-9]●?){6,14}[0-9]$/,
    emailRegex: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
};
var patt = '^[A-Z]{2}[0-9]{1,2}(?:[A-Z])?(?:[A-Z]*)?[0-9]{4}$';

var cryptoSettings = {
    password: process.env.secret || '=^U^80E5=9TQXTXU'
};

var decide = function(model, decoded, req, res, next) {
    if (model) {
        if (model.isActive) {
            req.details = model;
            next();
        } else {
            handler.sendErr(handler.ACCOUNT_SUSPENDED, res);
        }
    } else {
        handler.sendErr(handler.TOKEN_EXPIRED, res);
    }
};

var obj = {
    sendErr: true,
    userTokenKey: process.env.jwtSecret || '8p!RxWD0tb@f7vBg',
    accessTokenKey: process.env.accessSecret || '2$03cYqkswff^9CX',
    isPhone: function(phoneNumber) {
        return (regex.phoneRegex).test(phoneNumber);
    },
    isEmail: function(email) {
        return (regex.emailRegex).test(email);
    },
    isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    identifyUsername: function(username) {
        if (this.isEmail(username)) {
            return 'email';
        } else if (this.isNumber(username)) {
            return 'phone';
        } else {
            return 0;
        }
    },
    getDate: function() {
        return moment().format('DD-MM-YYYY');
    },
    getDay: function() {
        return moment().format('ddd');
    },
    encrypt: function(text) {
        return crypto.encrypt(text, cryptoSettings.password);
    },
    decrypt: function(cipher) {
        return crypto.decrypt(cipher.toString(), cryptoSettings.password);
    },
    createCustomToken: function(data) {
        return jsonwebtoken.sign(data, obj.userTokenKey, { expiresIn: '20min' }); //expire in 2 minutes
    },
    decodeCustomToken: function(token, cb) {
        return jsonwebtoken.verify(token, obj.userTokenKey, function(err, decoded) {
            if (err) {
                cb(err);
            } else {
                cb(null, decoded);
            }
        });
    },
    createToken: function(model) {
        return jsonwebtoken.sign({
            _id: model._id,
            state: model.state,
            expire: date.addToTimestamp(preset.user.tokenExpiryTime * 6)
        }, obj.userTokenKey);
    },
    createAccessToken: function(model) {
        return jsonwebtoken.sign({
            _id: model._id,
            state: model.state,
            expire: date.addToTimestamp(preset.user.tokenExpiryTime * 6)
        }, obj.accessTokenKey);
    },
    verifyAccessToken: function(req, res, next) {
        var token = req.headers['x-access-token'];
        var key = obj.accessTokenKey;
        jsonwebtoken.verify(token, key, function(err, decoded) {
            if (err) {
                handler.sendErr(handler.NOT_AUTHORISED, res);
            } else {
                if (decoded._id) {
                    userSchema.findOne({ _id: decoded._id }, function(err, model) {
                        if (model) {
                            if (model._id === decoded._id) {
                                if (model.isActive) {
                                    req.details = model;
                                    req.details.access = true;
                                    next();
                                } else {
                                    handler.sendErr(handler.ACCOUNT_SUSPENDED, res);
                                }
                            } else {
                                handler.sendErr(err.message, res);
                            }
                        } else handler.sendErr(handler.USER_NOT_FOUND, res);
                    });
                } else {
                    req.body = decoded;
                    return next()
                }
            }
        });
    },
    verifyIfToken: function(req, res, next) {
        var token = req.headers['x-access-token'];
        if (!token) {
            return next();
        } else obj.verifyToken(req, res, next);
    },
    verifyToken: function(req, res, next) {
        var token = req.headers['x-access-token'] || req.params.token;
        var key = obj.userTokenKey;
        jsonwebtoken.verify(token, key, function(err, decoded) {
            if (err) {
                handler.sendErr(handler.NOT_AUTHORISED, res);
            } else {
                if (decoded._id) {
                    userSchema.findOne({ _id: decoded._id }, function(err, model) {
                        if (model) {
                            if (model._id === decoded._id) {
                                if (model.isActive) {
                                    req.details = model;
                                    req.details.access = true;
                                    next();
                                }
                            } else {
                                handler.sendErr(err.message, res);
                            }
                        } else handler.sendErr(handler.USER_NOT_FOUND, res);
                    });
                } else {
                    req.body = decoded;
                    return next()
                }

            }
        });
    },
    recaptcha: function(req, res, next) {
        if (!config.recaptcha.isEnabled) return next();
        recaptcha.verify(req, function(error, data) {
            if (!error)
                next();
            else
                return handler.sendErr(handler.CAPTCHA_FAILED, res);
        });
    },
};

module.exports = obj;