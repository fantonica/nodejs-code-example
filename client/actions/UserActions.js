var AppDispatcher = require('../dispatcher/AppDispatcher');
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var r = require('superagent');

var DashboardActions = {
  fetchViews: function() {
    r.get('/api/views').end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_VIEWS_SUCCESS,
        data: JSON.parse(res.text)
      });
    });
  },

  fetchUsers: function(){
    r.get('/api/admin/user/list').end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_USERS_SUCCESS,
        data: JSON.parse(res.text)
      });
    });
  },

  fetchTypes: function(){
    r.get('/api/admin/view/types').end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_TYPES_SUCCESS,
        data: JSON.parse(res.text)
      });
    });
  },

  fetchUsersById: function(id, callback){

    if(!id) return;

    r.get('/api/admin/user/' + id + '/info').end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_USER_SUCCESS,
        data: JSON.parse(res.text)
      });
    });

  },

  fetchAllUnits: function(data){
    r.get('/api/admin/unit/list').query(data).end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_UNITS_SUCCESS,
        data: JSON.parse(res.text)
      });
    });
  },

  fetchPersonsById: function(id){
    r.get('/api/admin/unit/' + id + '/persons').end(function(err, res){
      if (!err){

        var data = JSON.parse(res.text);

        data['base_id'] = id;

        AppDispatcher.handleServerAction({
          actionType: ActionTypes.DASHBOARD_REQUEST_PERSONS_SUCCESS,
          data: data
        });
      }
    });
  },

  fetchView: function(id){
    r.get('/api/admin/view/' + id + '/get').end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_VIEW_SUCCESS,
        data: JSON.parse(res.text)
      });
    });
  },

  login: function(data){
    r.post('/api/admin/user/signin').send(data).end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_LOGIN_SUCCESS,
        data: JSON.parse(res.text)
      })
    })
  },

  logout: function(){
    r.post('/api/admin/user/signout').end(function(err, res){
      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_LOGOUT_SUCCESS,
        data: JSON.parse(res.text)
      })
    })
  },

  loggedin: function(data){
    r.post('/api/admin/user/loggedin').end(function(err, res){
      if (res && 401 == res.status){
        AppDispatcher.handleServerAction({
          actionType: ActionTypes.DASHBOARD_REQUEST_ERROR_401,
          data: {error: 401}
        });
      }

      if (!err) AppDispatcher.handleServerAction({
        actionType: ActionTypes.DASHBOARD_REQUEST_LOGGEDIN_SUCCESS,
        data: JSON.parse(res.text)
      })
    })
  },

  sendForm: function(url, method, data){
    if(method == 'get'){
      r.get(url).end(function(err, res){
        if (!err) AppDispatcher.handleServerAction({
          actionType: ActionTypes.DASHBOARD_REQUEST_FORM_SUCCESS,
          data: JSON.parse(res.text)
        })
      })
    }
    if(method == 'post'){
      r.post(url).send(data).end(function(err, res){
        if (!err && res.text) AppDispatcher.handleServerAction({
          actionType: ActionTypes.DASHBOARD_REQUEST_FORM_SUCCESS,
          data: JSON.parse(res.text)
        })
      })
    }

  }

};

module.exports = DashboardActions;