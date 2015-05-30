var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async')
  , Unit = require('./unit');

var PlanningInfoSchema = mongoose.Schema({
  title: { type: String, required: false },
  occupation_decimal: { type: Number, required: false },
  norm_time: { type: Number, required: false },

  section_unit_id: { type: String, required: false },           //  section id as string 
  _section_unit: { type: Schema.Types.ObjectId, ref: 'Unit' },  //  section id as object

  agreement_id: { type: String, required: false },
  agreement_label: { type: String, required: false },

  // Period
  period_start: { type: Date, required: false },
  period_length: { type: Number, required: false },

  rule_group_label: { type: String, required: false },

  // validity
  validity_start: { type: Date, required: false },
  validity_end: { type: Date, required: false },

  deleted: { type: Boolean, required: false },

  person_id: { type: String, required: false },
  
  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

module.exports = mongoose.model('PlanningInfo', PlanningInfoSchema);
