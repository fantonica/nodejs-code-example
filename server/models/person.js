var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async')
  , moment = require('moment')
  , PlanningInfo = require('./planning_info')
  , Availability = require('./availability');

var PersonSchema = mongoose.Schema({
  id: { type: String, required: true, index: true },
  cpr: { type: String, required: false },
  extra: { type: String, required: false },
  salary_id: { type: String, required: false },
  
  first_name: { type: String, require: false },
  second_name: { type: String, required: false },
  
  title: { type: String, required: false },

  skills: { type: String, required: false },

  unit_text: { type: String, required: false },
  initials: { type: String, required: false },
  phone: { type: String, required: false },
  alt_phone: { type: String, required: false },
  valid_from: { type: Date, required: false },
  valid_to: { type: Date, required: false },
  seniority_date: { type: Date, required: false },
  deleted: { type: Boolean, required: false },
  commit_id: { type: String, required: false },
  external_institution_id: { type: String, required: false },

  image_url: { type: String, required: false },
  image_key: { type: String, required: false },

  // using which unit_id parsed this person
  unit_id: { type: String, required: false },

  _planning_info: [{ type: Schema.Types.ObjectId, ref: 'PlanningInfo' }],

  _availabilities: [{ type: Schema.Types.ObjectId, ref: 'Availability' }],

  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

module.exports = mongoose.model('Person', PersonSchema);
