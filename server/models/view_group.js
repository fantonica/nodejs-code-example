var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async')
  , Person = require('./person')
  , Unit = require('./unit');

var ViewGroupSchema = mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },

  base_unit: { type: Schema.Types.ObjectId, ref: 'Unit' },

  accepted_units: [{ type: String, required: true }],               //  deprecated

  _persons: [{ type: Schema.Types.ObjectId, ref: 'Person' }],       //  deprecated

  persons: [{
    accepted_units: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
    person: { type: Schema.Types.ObjectId, ref: 'Person' }
  }],
  
  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

module.exports = mongoose.model('ViewGroup', ViewGroupSchema);
