/**
 * Created by karankohli13 on 05/11/17.
 */

let express = require('express'),
    config = require('../../../config'),
    router = express.Router(),
    controller = require('./controller'),
    auth = require('../../utils/keyTool'),
    validator = require('../../utils/validator');

/* --------------   DESKTOP ROUTES START ----------------  */
router
//Login
    .post('/user/login', auth.recaptcha, validator.checkLogin, controller.login)
    .post('/user/forgot', controller.forgot)
    .post('/user/reset', controller.reset)

    //Signup
    .post('/user/signup', validator.checkSignup, controller.signup)
    .post('/user/verify', auth.verifyIfToken, controller.verify)
    .get('/user/verify/:code', controller.verify)
    .post('/user/profile', auth.verifyToken, validator.checkpassword, controller.profile)

    //Update Profile
    .put('/user', auth.verifyToken, controller.update)

    //Change Password
    .put('/user/resetPassword', auth.verifyToken, controller.resetPassword)
    // get all users in db
    .get('/user/getUsers', controller.getUsers)
;


/* --------------   DESKTOP ROUTES END ----------------  */

module.exports = {
    desktop: router
};
