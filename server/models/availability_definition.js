var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async');

var workTypes = {
  OVERTIME: 'overtime',
  VACATION: 'vacation',

};

var AvailabilityDefinitionSchema = mongoose.Schema({
  available: { type: Boolean, required: true, default: true },
  category: { type: String, required: false },                      //  definition short name
  type: { type: String, required: false },                          //  type number from service:  600, 100, 740
  designation: { type: String, required: false },

  work_type: { type: String, required: false, default: null },      //  overtime, vacation, ill

  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

module.exports = mongoose.model('AvailabilityDefinition', AvailabilityDefinitionSchema);

module.exports.workTypes = workTypes;
