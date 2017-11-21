/**
 * Created by karankohli13 on 5/11/17.
 */

var config = require('./config');
var validator = require('./modules/utils/validator');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var server = http.createServer(app);
mongoose.Promise = require('bluebird');
var mongoSanitize = require('mongo-express-sanitize');
var helmet = require('helmet');
const expressValidator = require('express-validator');
const requestIp = require('request-ip');
var logger = require('logzio-nodejs');
var swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');


app.use(helmet());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(requestIp.mw());
app.use(expressValidator(validator.customSanitizers));
app.use(mongoSanitize.default());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


var connection = mongoose.connection;
connection.on('error', function(error) {
  //console.error.bind(console, 'error connecting with mongodb database:')
  console.log('Mongodb Connection Error');
  console.log(error);
});

connection.once('open', function() {
  console.log('database connected event log');
});

connection.on('disconnected', function() {
  //Reconnect on timeout
  mongoose.connect(config.db, {
    server: {
      auto_reconnect: true,
      socketOptions: {
        keepAlive: 500,
        connectTimeoutMS: 90000,
        socketTimeoutMS: 90000
      }
    }
  });
}, function(err) {
  if (err)
    console.log(err);
  else {
    console.log('database connected after disconnect');
  }
  connection = mongoose.connection;
});

mongoose.connect(config.db, {
  server: {
    auto_reconnect: true,
    socketOptions: {
      keepAlive: 500,
      connectTimeoutMS: 90000,
      socketTimeoutMS: 90000
    },
    connectWithNoPrimary: true
  }
}, function(err) {
  if (err) {
    console.log('Mongodb connection error 1st');
    console.log(err);
  } else {
    console.log('database connected');
  }

});


server.listen(config.port, function(err) {
  if (err)
    console.log(err);
  else
    console.log('server running at  ' + config.port);

});


var cors = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "accept, content-type, x-access-token, x-requested-with");
  next();
};

app.use(cors);

//BootStrap our router
app.use(require('./modules/mainRouter'));



// logoz.io configurations
logger.createLogger({
  token: 'your-key',
  host: 'listener.logz.io'
});
