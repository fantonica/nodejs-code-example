var express = require('express')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , methodOverride = require('method-override')
  , logger = require('morgan')
  , errorHandler = require('errorhandler')
  , path = require('path')
  , fs = require('fs')
  , mongo = require('./db/mongo');

var app = express();

var config = require('../../../config/server/application')[app.get('env')];
app.set('config', config);

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session(require('./session').init(config.session).getObject()));

// init libs from app/lib/env folder, that belongs to environment
fs.readdirSync(__dirname + '/../env/').forEach(function (name) {
  require('../env/' + name)(app);
});

// all environments
app.set('port', process.env.PORT || 3000);

app.set('views', __dirname + '/../../views');

app.use(logger('dev'));

app.use(methodOverride());
app.use(express.static(path.join(__dirname, '../../../../public/')));
// app.use(express.static(path.join(__dirname, '../../../../uploads/')));
// app.use(app.router);

// development only
if (app.get('env') === 'development') {
  app.use(errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
}

module.exports = app;

module.exports.connect = function (callback) {
  // TODO  abstract db connect assign
  mongo.connect(app, callback);
}

module.exports.initRouting = function () {
  fs.readdirSync(__dirname + '/../../controllers/').forEach(function (name) {
    require('../../controllers/' + name)(app);
  });
}
