var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async')
  , Person = require('./person');

var UnitSchema = mongoose.Schema({
  id: { type: String, required: true, index: true },
  label: { type: String, required: true, index: true },
  remark: { type: String, required: false },
  text: { type: String, required: false },

  properties: [{ type: Number }],
  titles: [{ type: String }],

  _persons: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
  
  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

module.exports = mongoose.model('Unit', UnitSchema);
