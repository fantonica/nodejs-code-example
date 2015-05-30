var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async')
  , Person = require('./person')
  , Unit = require('./unit')
  , AvailabilityDefinition = require('./availability_definition');

var contributionType = {
  ABSENCE: 'absence',
  DUTY: 'duty'
};

var AvailabilitySchema = mongoose.Schema({
  _person: { type: Schema.Types.ObjectId, ref: 'Person', required: false },
  person_id: { type: Number, required: false, index: true },

  unit_id: { type: String, required: true },

  employment_unit_id: { type: String, required: false },
  work_unit_id: { type: String, required: false },
  _employment_unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
  _work_unit: { type: Schema.Types.ObjectId, ref: 'Unit' },

  kind: { type: String, required: false },

  start_time: { type: Date, required: false },
  end_time: { type: Date, required: false },

  _contributions: [{
    definition: { type: Schema.Types.ObjectId, ref: 'AvailabilityDefinition' },
    type: { type: String, required: true, default: contributionType.DUTY }
  }],

  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

module.exports = mongoose.model('Availability', AvailabilitySchema);

module.exports.contributionType = contributionType;
