var ejs = require('ejs');

Base = function() {
  var config = {};

  this.setConfig = function (conf) {
    config = conf;
  }

  this.getConfig = function () {
    return config;
  }

  this.renderTemplate = function (name, params) {
    var path = __dirname + '/../../../views/mail/'+ name +'.ejs'
      , str = require('fs').readFileSync(path, 'utf8')
      , fn = ejs.compile(str);

    return fn(params);
  }
};
Base.prototype.send = function(options, templateOptions, callback) {
  throw new Error("This method must be overwritten!");
};

module.exports = Base;
