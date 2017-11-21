/**
 * Created by karankohli13 on 06/11/17.
 */

var model = require('../models/user'),
    date = require('../utils/datesHelper'),
    _ = require('lodash');

function UserModel() {
}

UserModel.prototype.find = function (params, selector, query, cb) {
    model.find(params, function (err, list) {
        if (!err) {
            cb(false, list);
        } else {
            cb(err, false);
        }
    })
        .select(selector || '')
        .populate(query || '');
};

UserModel.prototype.findOne = function (params, selector, query, cb) {
    model.findOne(params, function (err, data) {
        if (!err) {
            cb(false, data);
        } else {
            cb(err, false);
        }
    })
        .select(selector)
        .populate(query);
};

UserModel.prototype.create = function (obj, cb) {
    obj = _.omit(obj, ['_id', 'loginAt', 'updatedAt', 'isBlocked', 'unblockAt', 'isActive']);
    obj.createdAt = date.unixTimestamp();
    new model(obj).save(function (err, data) {
        if (!err) {
            cb(false, data);
        } else {
            cb(err, false);
        }
    });
};

UserModel.prototype.count = function (params, cb) {
    model.count(params, function (err, count) {
        if (!err) {
            cb(false, count);
        } else {
            cb(err, false);
        }
    });
};

UserModel.prototype.findOneAndUpdate = function (query, params, cb) {
    model.findOneAndUpdate(query, params, {new: true, upsert: true}, function (err, data) {
        if (!err) {
            cb(false, data);
        } else {
            cb(err, false);
        }
    });
};

UserModel.prototype.update = function (query, params, cb) {
    model.update(query, { $setOnInsert : params }, function (err, data) {
        if (!err) {
            cb(false, data);
        } else {
            cb(err, false);
        }
    });
};

module.exports = new UserModel();
