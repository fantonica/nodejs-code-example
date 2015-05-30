var path = require('path'),
    fs = require('fs')
    async = require('async');

var getConnection = function (config) {
  if (!global.hasOwnProperty('db')) {
    var Sequelize = require('sequelize-mysql').sequelize
      , sequelize = null;

    var match = config.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

    sequelize = new Sequelize(match[5], match[1], match[2], {
      dialect:  'mysql',
      protocol: 'mysql',
      port:     match[4],
      host:     match[3],
      // logging:  true
    })
   
    GLOBAL.db = {
      Sequelize: Sequelize,
      sequelize: sequelize,
    }
  }

  return global.db;
}

module.exports.getConnection = getConnection;

module.exports.connect = function (app, callback) {
  var connection = getConnection(app.get('config').db);

  GLOBAL.models = require(__dirname + '/../../../app/models/models')(connection.sequelize);
  GLOBAL.db = connection.sequelize;
  
  // init models for sync
  // fs.readdirSync(__dirname + '/../../../app/models/').forEach(function(name) {
    // if (name != 'helper' && name != '_references.js')
      // connection.sequelize.import(__dirname + '/../../../app/models/' + name);
  // });
  
  // fs.exists(__dirname + '/../../../app/models/_references.js', function (exists) {
    // if (exists)
     // connection.sequelize.import(__dirname + '/../../../app/models/_references.js'); 
  // })

  async.series([
    function(callback) {
      connection.sequelize.query("SET FOREIGN_KEY_CHECKS = 0").complete(callback);
    },
    function(callback) {
      callback(null);
      // connection.sequelize.sync({ force: true }).complete(callback);
    },
    function(callback) {
      connection.sequelize.query("SET FOREIGN_KEY_CHECKS = 1").complete(callback);
    }]
  , function (err) {
    if (err) {
      throw err
    } else {
      app.set('db', connection);
      callback(err, connection.sequelize)
    }
  });
}
