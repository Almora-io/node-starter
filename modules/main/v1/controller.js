/**
 * Created by karankohli13 on 05/11/17.
 */

var bluebird = require('bluebird'),
  userSchema = require('../../models/user'), // user model
  keytool = require('../../utils/keyTool'),
  userFunc = require('../../model_functions/user'), // user model function
  handler = require('../../utils/handler'),
  date = require('../../utils/datesHelper'),
  smsSender = require('../../utils/smsSender'),
  mailer = require('../../utils/mailer'),
  config = require('../../../config'),
  status = require('http-status-codes'),
  jsonwebtoken = require('jsonwebtoken'),
  asyncLoop = require('node-async-loop'),
  _ = require('lodash');

function Controller() {

}

Controller.prototype.login = function(req, res) {
  var body = req.body;
  userFunc.findOne({ "email.value": body.username }, { "password": 1, "isActive": 1 }, "", function(err, data) {
    if (err)
      handler.sendErr(handler.Error, res);
    else {
      if (!data || data === null)
        handler.sendErr(handler.USER_NOT_FOUND, res);
      else {
        if (!data.isActive)
          handler.sendErr(handler.ACCOUNT_INACTIVE, res);
        else {
          if (data.comparePassword(body.password)) {
            var loginToken = keytool.createToken(data);
            handler.sendRes(loginToken, res, "Login successfull");
          } else {
            handler.sendErr(handler.WRONG_PARAMS, res);
          }
        }
      }
    }
  });
};

Controller.prototype.verify = function(req, res) {
  function verifyToken(cb) {
    var token = req.params.code;
    var key = keytool.userTokenKey;
    jsonwebtoken.verify(token, key, function(err, decoded) {
      if (err) {
        handler.sendErr(handler.NOT_AUTHORISED, res);
      } else {
        if (decoded._id) {
          userSchema.findOne({ _id: decoded._id }, function(err, model) {
            if (model) {
              if (model._id === decoded._id) {
                req.details = model;
                req.details.access = true;
                return cb(req.details);
              } else {
                handler.sendErr(err.message, res);
              }
            } else handler.sendErr(handler.USER_NOT_FOUND, res);
          });
        } else {
          req.body = decoded;
        }

      }
    });
  }

  verifyToken(function(user) {
    if (user) {
      userFunc.findOneAndUpdate({ "_id": user._id }, { "email.isVerified": true, "isActive": true }, function(err, data) {
        if (err) {
          handler.sendErr(handler.ERROR, res);
        } else {
          handler.sendRes('', res, "User verified successfully");
          var opts = {
            email: user.email.value,
            type: 'user-verify',
          }
          mailer.send(opts);
        }
      });
    }
  });


};

Controller.prototype.signup = function(req, res) {
  var body = req.body;
  var data = {
    "email.value": body.email,
    "password": body.password,
    "name": body.name,
  };

  userFunc.create(data, function(err, data) {
    if (err)
      handler.sendErr(handler.ERROR, res, err.message);
    else {
      handler.sendRes('', res, "User saved successfully");
      var signupToken = keytool.createToken(data);
      var opts = {
        email: data.email.value,
        type: 'user-verify',
        link: config.app.domain + '/api/v1/user/verify/' + $ { signupToken }
      }
      mailer.send(opts);
    }

  });
};

module.exports = new Controller();
