var engine = require('ejs-locals');

module.exports = function(app) {
  app.set('view engine', 'ejs');
  app.engine('html', engine);
  // app.engine('html', require('ejs').renderFile);
}
