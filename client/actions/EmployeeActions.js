var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var ApiUtils = require('../utils/ApiUtils');
var r = require('superagent');

var EmployeeActions = {
    fetchWeek: function(week) {

        AppDispatcher.handleServerAction({
            actionType: ActionTypes.EMPLOYEE_REQUEST_WEEK
        });

        r.get('/api/view/week?view=' + ApiUtils.parseViewId() + '&week=' + week).end(function(err, res){
            if (!err) AppDispatcher.handleServerAction({
                actionType: ActionTypes.EMPLOYEE_REQUEST_WEEK_SUCCESS,
                data: JSON.parse(res.text)
            });
        });
    },

    filterEmployeesList: function(query) {
      AppDispatcher.handleServerAction({
        actionType: ActionTypes.EMPLOYEE_LIST_SEARCH,
        searchQuery: query
      });
    }
};

module.exports = EmployeeActions;