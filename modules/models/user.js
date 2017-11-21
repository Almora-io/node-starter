/**
 * Created by karankohli13 on 05/11/17.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    presets = require('../preset'),
    dates = require('../utils/datesHelper'),
    uuid = require('uuid'),
    _ = require('lodash');


var model = new Schema({

    _id: { type: String, default: uuid.v4 },

    //Track
    createdAt: { type: Number, default: null },
    updatedAt: { type: Number, default: null },
    attempts: { type: Number, default: 1, select: false },
    refresh_token: { type: String, default: null },
    status: { type: Boolean, default: false },
    resetPswd: {
        isRequested: { type: Boolean, default: false, select: false },
        attempts: { type: Number, default: 0 },
    },
    //Required
    email: {
        value: { type: String, unique: true },
        isVerified: { type: Boolean, default: false }
    },
    password: { type: String, trim: true, select: false },

    name: { type: String },
    //State Variables
    isActive: { type: Boolean, default: false },
});

model.pre(
    'save',
    function(next) {
        var model = this;
        if (!model.isModified('password')) return next();
        model.updatedAt = dates.unixTimestamp();
        bcrypt.hash(model.password, null, null, function(err, hash) {
            if (err) return next();
            model.password = hash;
            next();
        });
    });

/*  Method to compare password during login and password change */
model.methods.comparePassword = function(password) {
    try {
        var obj = this;
        var isCorrect = bcrypt.compareSync(password, obj.password);
        if (isCorrect === true) {
            obj.attempt = 1;
            obj.isBlocked = false;
            obj.loginAt = dates.unixTimestamp();
            obj.save(function() {});
            return true;
        } else {
            if (obj.attempt < presets.user.maxLoginAttempts) {
                obj.attempt++;
                obj.save(function() {});
                return false;
            } else {
                obj.isBlocked = true;
                obj.unblockAt = dates.addToTimestamp(presets.user.unblockTime);
                obj.save(function() {});
                return false;
            }
        }
    } catch (e) {
        return false;
    }

};

module.exports = mongoose.model('user', model);