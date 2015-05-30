var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var ApiUtils = require('../utils/ApiUtils');
var r = require('superagent');

var PatientActions = {
    fetchDay: function(day) {
        r.get('/api/view/day?view=' + ApiUtils.parseViewId() + '&day=' + day).end(function(err, res){
            if (!err) AppDispatcher.handleServerAction({
                actionType: ActionTypes.PATIENT_REQUEST_DAY_SUCCESS,
                data: JSON.parse(res.text)
            });
        });
    },
    fetchWeek: function(week, group) {
        r.get('/api/view/patient/week?view=' + ApiUtils.parseViewId()).end(function(err, res){
            if (!err) AppDispatcher.handleServerAction({
                actionType: ActionTypes.PATIENT_REQUEST_WEEK_SUCCESS,
                data: JSON.parse(res.text)
            });
        });
    }
};

module.exports = PatientActions;