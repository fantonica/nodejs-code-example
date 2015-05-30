var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt-nodejs')
  , SALT_WORK_FACTOR = 10
  , validation = require('./helper/validation')
  , Unit = require('./unit');

// Define roles
var rolesCodes = {
  PLANNER: 'planner',
  ADMIN: 'admin'
};

var rolesTitles = {};

rolesTitles[rolesCodes.PLANNER] = 'Planner';
rolesTitles[rolesCodes.ADMIN] = 'Admin';

// Schema definition 
var UserSchema = mongoose.Schema({
  email: { type: String, required: true, index: true, unique: true },
  
  first_name: { type: String, required: false },
  second_name: { type: String, required: false },

  password: { type: String, required: true},

  // restrictions role 
  role: { type: String, required: true, default: rolesCodes.PLANNER },

  // User units area
  units: {
    accepted: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
  },

  reset: {
    token: { type: String, required: false },
    expires: { type: Date, required: false },
  },
  
  created_at: { type: Date, required: false }
});

// Validation rules
UserSchema.path('email').validate( validation.uniqueFieldInsensitive('User', 'email'), 'Email already in use' );

UserSchema.pre('save', function (next) {
  var user = this
    , crypto = require('crypto')
    , shasum = crypto.createHash('sha1');
  
  if (!user.created_at) user.created_at = new Date();

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function () {}, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Password verification
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);

module.exports.roles = {
  codes: rolesCodes,
  titles: rolesTitles
}
