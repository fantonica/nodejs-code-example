var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('../../models/user');

module.exports = function (app) {
  // Passport init
  passport.serializeUser(function (user, done) {
    if (user) {
      done(null, user);
    }
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function (email, password, done) {
    User.findOne({
      'email': email
    }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Unknown user with email ' + email
        });
      }
      user.comparePassword(password, function (err, isMatch) {
        if (err) return done(err);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
      });
    });
  }));

  // passport init for express
  app.use(passport.initialize());
  app.use(passport.session());

  return passport;
};
