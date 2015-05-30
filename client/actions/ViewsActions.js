var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var r = require('superagent');

var DashboardActions = {
    fetchViews: function() {
        r.get('/api/admin/view/list').end(function(err, res){
            if (!err) AppDispatcher.handleServerAction({
                actionType: ActionTypes.DASHBOARD_REQUEST_VIEWS_SUCCESS,
                data: JSON.parse(res.text)
            });
        });
    },
    deleteView: function(data){
      r.post('/api/admin/view/delete').send(data).end(function(err, res){
        if (!err) AppDispatcher.handleServerAction({
          actionType: ActionTypes.DASHBOARD_REQUEST_VIEWS_DELETED,
          data: JSON.parse(res.text)
        });
      });
    }
};

module.exports = DashboardActions;