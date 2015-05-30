var auth = require('basic-auth');

module.exports = function (app) {
  var config = app.get('config');

  if (typeof config.secure != 'undefined' && typeof config.secure.type != 'undefined' && config.secure.type == 'basic') {
    app.use(function (req, res, next) {
      var user = auth(req);

      if (user === undefined || user['name'] !== config.secure.credentials.username || user['pass'] !== config.secure.credentials.password) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Specify credentials for SD Plan"');
        res.end('Unauthorized');
      } else {
        next();
      }
    });
  }
}
