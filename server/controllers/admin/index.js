var fs = require('fs')
  , crypto = require('crypto')
  , secure = require('../../lib/secure')
  , User = require('../../models/user');

module.exports = function (app) {
  var mailer = require('../../lib/mailer')(app);

  // get all controller in this directory and init
  fs.readdirSync(__dirname).forEach(function (name) {
    if (name != 'index.js')
      require('./' + name)(app);
  });

  app.get('/admin/login', function (req, res) {
    res.render('admin/view/login.html');
  });

  app.get('/employee/list', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/employee-list.html');
  });

  app.get('/employee/list/add', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/employee-list.html');
  });

  app.get('/admin/dashboard', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/dashboard.html');
  });

  app.get('/admin/dashboard/create', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/create-view.html');
  });

  app.get('/admin/dashboard/edit', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/edit-view.html');
  });

  app.get('/profile', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/profile.html');
  });

  app.get('/admin/users', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/users.html');
  });

  app.get('/admin/help', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/help.html');
  });

  app.get('/admin/edit', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/edit-user.html');
  });

  app.get('/admin/create', secure.isAuthenticated(secure.paths.ADMIN), function (req, res) {
    res.render('admin/view/add-user.html');
  });

  app.get('/admin/forgot_password', function (req, res) {
    res.render('admin/view/forgot_password.html');
  })

  app.get('/admin/reset_password/:token', function (req, res) {
    User
      .findOne({ 
        'reset.token': req.params.token, 
        'reset.expires': { $gt: Date.now() } 
      })
      .exec(function (err, user) {
        if (!user) {
          res.sendStatus(404);
        } else {
          crypto.randomBytes(20, function (err, buf) {
            var generated = buf.toString('hex');
            
            var password = generated.substring(0, 7);

            user.set('password', password);
            user.save(function (err, oUser) {
              mailer.send({
                to: {
                  email: user.email
                },
                subject: "You have received new password",
              }, {
                name: 'user/reset_password', 
                params: { domain: app.get('config').domain, password: password }
              },
              function (err, response) {})

              res.render('admin/view/reset_password.html');
            })
          });
        }
      });
  });

}
