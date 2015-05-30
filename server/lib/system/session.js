var session = require('express-session')
  , redis = require('redis')
  , redisStore = require('connect-redis')(session);

/**
 * Defined types
 * @type {Object}
 */
var types = {
  MEMORY: 'memory',
  REDIS: 'redis'
}

/**
 * Eap session class definition
 * @param {Object} config
 */
function EapSession (config) {
  this.config = config || {};
}

/**
 * Static defined types
 * @type {Object}
 */
EapSession.prototype.types = types;

/**
 * Getting Redis store object
 * @return {connect-redis}
 */
EapSession.prototype.getRedisStore = function () {
  return new redisStore({ host: this.config.store.host || 'localhost', port: this.config.store.port || 6379, client: redis.createClient() });
}

/**
 * Getting memory store object
 * @return {Object}
 */
EapSession.prototype.getMemoryStore = function () {
  return null;
}

/**
 * Getting session object
 * @param  {String} store [cast store string example:  'memory']
 * @return {Object}
 */
EapSession.prototype.getObject = function (store) {
  var definition = {
    secret: this.config.secret || 'eapApplicationSuperSecretKey',
    saveUninitialized: (this.config.saveUninitialized != null) ? this.config.saveUninitialized : true,
    resave: (this.config.resave != null) ? this.config.resave : true
  };

  if (!store) {
    store = (typeof this.config.store != 'undefined' && typeof this.config.store.type != 'undefined') 
      ? this.config.store.type
      : types.MEMORY; // default
  }

  var methodName = 'get' + store.charAt(0).toUpperCase() + store.substring(1) + 'Store';

  if (typeof this[methodName] != 'function')
    throw new Error("Store method " + methodName + " not defined");
  
  var store = this[methodName]();
  if (store)
    definition.store = store;

  return definition;
};

module.exports = EapSession;

// static init
module.exports.init = function (config) {
  return new EapSession(config);
}
