var AWS = require('aws-sdk');

/**
 * Buckets keys in config
 * @type {Object}
 */
var buckets = {
  PROFILE: 'profile'
}

function S3 (app) {
  this.config = app.get('config');
}

/**
 * Buckets definition
 * 
 * @type {Object}
 */
S3.prototype.buckets = buckets;

/**
 * Getting configured AWS instance
 * 
 * @return {AWS.S3}
 */
S3.prototype.getObject = function () {
  if (typeof this.config.amazon != 'undefined' && typeof this.config.amazon.s3 != 'undefined' && typeof this.config.amazon.s3.creds != 'undefined') {
    AWS.config.update({
      accessKeyId: this.config.amazon.s3.creds.AWS_ACCESS_KEY,
      secretAccessKey: this.config.amazon.s3.creds.AWS_SECRET_KEY
    });
  }

  return new AWS.S3();
};

/**
 * Getting bucket key by name from config
 * 
 * @param  {String} name
 * @return {String}
 */
S3.prototype.getBucketKey = function (name) {
  if (typeof this.config.amazon != 'undefined' && typeof this.config.amazon.s3 != 'undefined' && typeof this.config.amazon.s3.bucket != 'undefined' && typeof this.config.amazon.s3.bucket[name] != 'undefined') 
    return this.config.amazon.s3.bucket[name];
  else
    return null;
}

module.exports = S3;

// static init
module.exports.init = function (app) {
  return new S3(app);
}
