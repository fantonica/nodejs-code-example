var mongoose = require('mongoose');

module.exports.connect = function (app, callback) {
  mongoose.connect(app.get('config').db, function(err) {
    if (err)
      console.log(err);

    app.set('db', mongoose);

    callback(err, mongoose);
  });
}

module.exports.disconnect = function () {
  mongoose.disconnect();
}
