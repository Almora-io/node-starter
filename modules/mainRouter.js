/**
 * Created by karankohli13 on 05/11/17.
 */

var express = require('express');
var router = express.Router();
var config = require('./../config');

router.use('/api/' + config.app.desktopApi, require('./main/' + config.app.desktopApi + '/router').desktop);

module.exports = router;
