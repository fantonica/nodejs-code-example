var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async');

var statusCodes = {
  ACTIVE: 'active',
  FINISHED: 'finished'
};

var ParserSchema = mongoose.Schema({
  name: { type: String, required: true },
  
  // active, finished
  status: { type: String, required: true, default: statusCodes.ACTIVE },

  _options: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],

  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

module.exports = mongoose.model('Parser', ParserSchema);

module.exports.statusCodes = statusCodes;
