var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var ApiUtils = require('../utils/ApiUtils');

var r = require('superagent');

var EmployeeActions = {
  fetchEmployeesList: function() {
    r.get('/api/admin/person/list').end(function(err, res) {
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.EMPLOYEE_LIST_REQUEST,
        employeesList: JSON.parse(res.text)
      });
    });
  },
  uploadFile: function(data){
    r.post('/api/admin/person/upload_image').send(data).end(function(err, res) {

      if(res && res.status == 413){
        ApiUtils.notification("Request Entity Too Large", {delay: 0, type: "danger"});
      }
      if(!err){
        AppDispatcher.handleServerAction({
          actionType: ActionTypes.EMPLOYEE_UPLOAD_IMAGE,
          data: JSON.parse(res.text)
        });
      }
    }).on("progress", function(e){
      AppDispatcher.handleServerAction({
        actionType: ActionTypes.EMPLOYEE_UPLOAD_PROGRESS,
        data: Math.round(e.percent)
      });
    });

  },
  removeImg: function(data){
    r.post('/api/admin/person/remove_image').send(data).end(function(err, res) {
      if(!err){
        AppDispatcher.handleServerAction({
          actionType: ActionTypes.EMPLOYEE_REMOVE_IMAGE,
          data: JSON.parse(res.text).id = data.id
        });
      }
    })
  },
  filterEmployeesList: function(query) {
    AppDispatcher.handleServerAction({
      actionType: ActionTypes.EMPLOYEE_LIST_SEARCH,
      searchQuery: query
    });
  },
  filterEmployeesByLetter: function(letter) {
    AppDispatcher.handleServerAction({
      actionType: ActionTypes.EMPLOYEE_LIST_LETTER,
      searchQuery: letter
    });
  }

};

module.exports = EmployeeActions;