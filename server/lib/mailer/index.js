
var mailer = {
  NodemailerAdapter: require('./adapters/nodemailer')
};

module.exports = function(app) {
  var config = app.get('config').mail;

  if (typeof config == 'undefined') {
    throw new Error("Mail config not specified");
  }

  var name = config.type;
  var adapterName = name.charAt(0).toUpperCase() + name.substr(1) + "Adapter";

  if (!mailer[adapterName]) {
    throw new Error("Adapter doesn't exists");
  }
  
  var adapter = new mailer[adapterName];
  adapter.setConfig(config);

  return adapter;
}
