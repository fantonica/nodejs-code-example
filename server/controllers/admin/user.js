var async = require('async')
  , passport = require('passport')
  , bodyParser = require('body-parser')
  , crypto = require('crypto')
  , secure = require('../../lib/secure')
  , User = require('../../models/user');

module.exports = function (app) {
  var mailer = require('../../lib/mailer')(app);

  /**
   * Getting user public data
   * 
   * @param  {User} user
   * @return {Object}
   */
  var getUserPublicData = function (user) {
    return { 
      email: user.email, 
      first_name: user.first_name,
      second_name: user.second_name,
      role: user.role,
      _id: user._id
    }
  }

  /*
   * Authentication controller, through passport 
   */
  app.post('/api/admin/user/signin', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) return next(err);
      if (!user) res.json(info);

      req.logIn(user, function (err) {
        if (err) return next(err);

        res.json({ success: true, data: getUserPublicData(user) });
      });
    })(req, res, next);
  });

  /*
   * Signout
   */
  app.post('/api/admin/user/signout', function (req, res, next) {
    req.logout();
    res.sendStatus(200);
  });

  /**
   * User update my info
   */
  app.post('/api/admin/user/update', secure.isAuthenticated(), function (req, res) {
    User.findOne({ email: req.user.email }, function (err, user) {
      if (err) {
        res.json({ success: false, message: err });
        return;
      }

      if (req.body.first_name) user.set('first_name', req.body.first_name);
      if (req.body.second_name) user.set('second_name', req.body.second_name);
      if (req.body.email) user.set('email', req.body.email);

      if (req.body.password) user.set('password', req.body.password);

      user.save(function (err) {
        if (err) {
          res.json({
            success: false, 
            message: err
          });
        } else {
          req.logIn(user, function (err) {
            if (err) {
              res.json({
                success: false, 
                message: err
              });
              return;
            }

            res.json({
              success: true,
              data: getUserPublicData(req.user)
            });
          });
        }
      })
    });
  });

  /*
   * Check is current user authenticated, if so returns current user data, in another case throw 401 in response
   */
  app.post('/api/admin/user/loggedin', secure.isAuthenticated(), function (req, res) {
    res.send(req.isAuthenticated() 
      ? getUserPublicData(req.user) 
      : null);
  });

  /**
   * Getting list of users for admin
   */
  app.get('/api/admin/user/list', secure.hasRole(User.roles.codes.ADMIN), function (req, res) {
    User
      .find({ role: User.roles.codes.PLANNER }, '_id email first_name second_name role')
      .exec(function (err, users) {
        res.json(users);
      })
  })

  /**
   * Create user functionality
   */
  app.post('/api/admin/user/push', secure.hasRole(User.roles.codes.ADMIN), function (req, res) {
    var userData = {};

    var c_id = req.body.c_id;

    if (req.body.first_name) userData.first_name = req.body.first_name;
    if (req.body.second_name) userData.second_name = req.body.second_name;
    if (req.body.email) userData.email = req.body.email;

    if (req.body.password) userData.password = req.body.password;

    userData.units = {};
    userData.units.accepted = req.body.units || [];

    async.waterfall([
      function (callback) {
        if (c_id) {
          User
            .findOne({ _id: c_id })
            .exec(function (err, user) {
              callback(err, user)
            })
        } else {
          callback(null, null);
        }
      },
      function (user, callback) {
        if (!user) {
          user = new User(userData);
        } else {
          Object.keys(userData).forEach(function (key) {
            user.set(key, userData[key]);
          });
        }

        callback(null, user);
      }
    ], function (err, user) {
      user.save(function (err, user_instance) {
        if (err) {
          res.json({ success: false, message: err });
        } else {
          res.json({
            success: true
          })
        }
      });
    })
  });
  
  /**
   * User info response for admin 
   */
  app.get('/api/admin/user/:id/info', secure.hasRole(User.roles.codes.ADMIN), function (req, res) {
    var _id = req.param('id');

    User
      .findOne({ _id: _id }, '_id email first_name second_name role units')
      .exec(function (err, user) {
        res.json({
          success: !!user,
          data: user
        })
      })
  })

  app.post('/api/admin/user/forgot_password', function (req, res) {
    var email = req.body.email;

    async.waterfall([
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function (token, done) {
        User
          .findOne({ email: email })
          .exec(function (err, user) {
            if (!user) {
              done('User with this email not registered');
            } else {
              user.set('reset.token', token);
              user.set('reset.expires', Date.now() + 3600000);

              user.save(function (err, oUser) {
                done(err, token, oUser);
              });
            }            
          });
      },
      function (token, user, done) {
        mailer.send({
          to: {
            email: user.email
          },
          subject: "You have requested reset password",
        }, {
          name: 'user/forgot_password', 
          params: { domain: app.get('config').domain, reset_token: token }
        },
        function (err, response) {
          done(null, 'done');
        })
      }
    ], function (err) {
      if (err) {
        res.json({
          success: false, 
          message: err
        })
      } else {
        res.json({
          success: true
        })
      }
    });
  })

};
