/**
 * Created by karankohli13 on 06/11/17.
 */

const {check, validationResult} = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');
var handler = require('./handler');

var obj = {
        customSanitizers: {
            toString: value => value.toString(),
            toLowCase: value => value.toLowerCase()
        },
        checkSignup: function (req, res, next) {

            req.checkBody("phone", "Invalid Phone Number")
                .optional({checkFalsy: true})
                .notEmpty()
                .matches('^(?=.*[+])(?=.*[0-9]).{10,20}$');

            req.checkBody("email", "Invalid Email")
                .optional({checkFalsy: true})
                .notEmpty()
                .isEmail();

            req.checkBody("password", "Invalid Password")
                .optional({checkFalsy: true})
                .notEmpty()
                /* between 8 and 24 chars, at least one of each type among lowercase, special,uppercase, and numbers */
                .matches('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-z])(?=.*[0-9]).{8,24}$');

            req.checkBody("name", 'Invalid Name')
                .optional({checkFalsy: true})
                .notEmpty()
                .isAscii();


            var error = req.validationErrors();
            if (error) {
                handler.sendErr(error, res);
            }
            else {
                next();
            }

        },
        checkpassword: function (req, res, next) {
            req.checkBody("password", "Invalid Input")
                .notEmpty()
                .matches('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-z])(?=.*[0-9]).{8,24}$');

            var error = req.validationErrors();
            if (error) {
                handler.sendErr(error, res);
            }
            else {
                req.sanitize('password').trim();
                req.sanitize('password').escape();
                next();
            }
        }
        ,
        checkLogin: function (req, res, next) {
            req.checkBody("username", "Invalid Username")
                .notEmpty();

            req.checkBody("password", "Invalid Password")
                .notEmpty()
                /* between 8 and 24 chars, at least one of each type among lowercase, special,uppercase, and numbers */
                .matches('^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-z])(?=.*[0-9]).{8,24}$');
            var error = req.validationErrors();
            if (error) {
                handler.sendErr(error, res);
            }
            else {
                req.sanitizeBody("username")
                    .trim();
                // ToDo Crashes here if not present
                req.sanitizeBody("password")
                    .toString()
                    .trim();
                next();
            }

        }
    }
;

module.exports = obj;
