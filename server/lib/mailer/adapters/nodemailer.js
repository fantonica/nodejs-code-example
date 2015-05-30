var util = require('util')
  , nodemailer = require('nodemailer')
  , Base = require('./base');


NodemailerAdapter = function() {
  Base.apply(this);

  var transport;

  this.getTransport = function () {
    if (typeof transport != 'undefined') {
      return transport;
    }

    var config = this.getConfig();
    
    var generator = require('xoauth2').createXOAuth2Generator(config.auth);

    var transport = nodemailer.createTransport(({
      service: 'gmail',
      auth: {
        xoauth2: generator
      }
    }));

    return transport;
  }
};

util.inherits(NodemailerAdapter, Base);

NodemailerAdapter.prototype.send = function(options, templateOptions, callback) {
  var config = this.getConfig();
  options.from = (options.from) 
                    ? (options.from.name + " <" + options.from.email + ">") 
                    : (config.from.name + " <" + config.from.email + ">");
  
  options.to = (typeof options.to.name != 'undefined')
    ? options.to.name + " <" + options.to.email + ">"
    : options.to.email;
  // options.to = options.to.name + " <" + options.to.email + ">";

  if (templateOptions.text) {
    options.text = templateOptions.text;
  }

  options.html = this.renderTemplate(templateOptions.name, templateOptions.params);

  var transport = this.getTransport();

  transport.sendMail(options, function (error, response) {
    transport.close();
    callback(error, response);
  });
};

module.exports = NodemailerAdapter;
