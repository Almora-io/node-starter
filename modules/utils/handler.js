/**
 * Created by karankohli13 on 05/11/17.
 */
var status = require('http-status-codes');

var handler = {

    /*GENERAL*/
    NOT_AUTHORISED: "Not Authorised",
    INVALID_ACCESS: "No Access",
    WRONG_PSWD: "Wrong password",
    WRONG_PARAMS: "Invalid Username or Password",
    ARG_MISSING: "Arguments Missing",
    ARG_WRONG: "Arguments Wrong",
    INVALID_PHONE: "Invalid Phone Number",
    INVALID_USERNAME: "Invalid Username",
    INVALID_EMAIL: "Invalid Email Address",
    ACCOUNT_SUSPENDED: "Account Suspended",
    ACCOUNT_INACTIVE: "Account Inactive",
    BLOCKED: "Account Blocked",
    SIGNUP_INCMP: "Signup Incomplete",

    PSWD_EXISTS: "Password Already Set",
    PSWD_SET: "Password Set Successfully",

    /*  UPDATE, CREATE, EXISTING  */
    EXISTING: " Already Exists",
    CREATION_FAILED: "Record Creation Failed",
    UPDATE_FAILED: "Record Updation Failed",
    ERROR: "Error Occured",

    /*USER*/
    USER_NOT_FOUND: "User Not Found",
    WRONG_USER_CREDENTIAL: "Invalid User Credentials",
    ALREADY_EXISTS: "User Already Exists",

    /*  TOKEN  */
    TOKEN_EXPIRED: "Token Expired",
    TOKEN_NOT_FOUND: "Token Not Found",

    /* VERIFY */
    OTP_NOTVERIFIED: "Code Wrong Or Expired",

    VERIFICATION_SENT: "Verification OTP Sent",

    CAPTCHA_FAILED: "Captcha Failed",
    CAPTCHA_MISSING: "Captcha Missing",


    /*USER*/
    NO_RECORDS: "0 Record(s)",

    /*APPS VALIDATION*/
    APP_VALIDATION: "This User is not authorised for this App",
    INVALID_APP_ID: "This is not a valid app",

    /*APPS VALIDATION*/
    SCENE_VALIDATION: "This App is not authorised for this scene",
    INVALID_SCENE_ID: "This is not a valid scene",

    sendErr: function(err, res, data) {
        res.status(status.FORBIDDEN).send({ status: false, message: err, data: data });
    },

    sendRes: function(data, res, msg) {
        res.status(status.OK).send({ status: true, message: msg || null, data: data });
    }
};

module.exports = handler;