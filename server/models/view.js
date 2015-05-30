var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , async = require('async')
  , ViewGroup = require('./view_group')
  , Unit = require('./unit');

// Define tyoes
var typesCodes = {
  EMPLOYEE_WEEK: 'employee_week',
  PATIENT_WEEK: 'patient_week',
  PATIENT_DAY: 'patient_day'
};

var typesTitles = {};
// set types titles
typesTitles[typesCodes.EMPLOYEE_WEEK] = 'Employee Week';
typesTitles[typesCodes.PATIENT_WEEK] = 'Patient Week';
typesTitles[typesCodes.PATIENT_DAY] = 'Patient Day';

var codesValues = [];
for (key in typesCodes) {
  codesValues.push(typesCodes[key]);
}

// types enum values and custom message
var typesEnum = {
  values: codesValues,
  message: 'Used wrong type `{VALUE}`'
}

// Schema definition
var ViewSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: typesEnum },
  status: { type: String, required: true, default: 'active' },

  _options: {
    show_fullname: { type: Boolean, required: false, default: false },
    show_photos: { type: Boolean, required: false, default: true },
    show_skills: { type: Boolean, required: false, default: true },
    days_ahead: { type: Number, required: false, default: 7 },
  },

  url: { type: String, required: false },

  units: {
    exists: [{ type: Schema.Types.ObjectId, ref: 'Unit' }]
  },

  _groups: [{ type: Schema.Types.ObjectId, ref: 'ViewGroup' }],             // deprecated

  groups: [{
    group: { type: Schema.Types.ObjectId, ref: 'ViewGroup' },
    order: { type: Number, default: 0 }
  }],
  
  // modification dates
  created_at: { type: Date, required: false, default: new Date() },
  updated_at: { type: Date, required: false, default: new Date() }
});

/**
 * Generate view url
 * 
 * @return {String}            [description]
 */
ViewSchema.methods.generateUrl = function () {
  var viewName = '';

  switch (this.type) {
    case typesCodes.EMPLOYEE_WEEK:
      viewName = 'employee';
      break;

    case typesCodes.PATIENT_WEEK:
      viewName = 'patient/week';
      break;

    case typesCodes.PATIENT_DAY:
      viewName = 'patient';
      break;
  }

  return viewName + '?view=' + this._id;
};

module.exports = mongoose.model('View', ViewSchema);

module.exports.types = {
  codes: typesCodes,
  titles: typesTitles
}
