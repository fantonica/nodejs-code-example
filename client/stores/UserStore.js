var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var _store = {
  users: [],
  user: [],
  units: [],
  info: [],
  types: [],
  persons: [],
  currentType: null
};

var UserStore = merge(EventEmitter.prototype, {

  getUserInfo: function(){
    return _store.info
  },

  setValue: function(prop, value){
    _store[prop] = value;
  },

  getValue: function(prop){
    return _store[prop];
  },

  getUser: function(){
    return _store.user;
  },

  getUnits: function(){
    return _store.units;
  },

  getUnitsByGroup: function(id){
    return _store.persons[id];
  },

  getUserList: function(){
    return _store.users
  },

  isSuccess: function(){
    return _store.form ? _store.form.success : false;
  },

  getTypesList: function(){
    return _store.types;
  },

  getFormData: function(){
    return _store.form;
  },

  redirect: function(url){
    localStorage.setItem('prev_url', location.pathname)
    window.location.replace(url);
  },

  isLoggedin: function(){
    return _store.info.error == 401 ? false : true;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addEventListener: function(event, callback){
    this.on(event, callback);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  makeDataArray: function(data){
    return makeArray(data);
  },

  pick: function(data, key){
    return pick(data, key);
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var key, action = payload.action;

    switch (action.actionType) {
      case ActionTypes.DASHBOARD_REQUEST_LOGIN_SUCCESS:
        _store['info'] = action.data;
        break;

      case ActionTypes.DASHBOARD_REQUEST_LOGGEDIN_SUCCESS:
        _store['info'] = action.data;
        break;

      case ActionTypes.DASHBOARD_REQUEST_LOGOUT_SUCCESS:
        _store['logout'] = action.data;
        UserStore.redirect('/admin/login');
        break;

      case ActionTypes.DASHBOARD_REQUEST_UNITS_SUCCESS:
        _store['units'] = action.data;
        break;

      case ActionTypes.DASHBOARD_REQUEST_PERSONS_SUCCESS:
        _store['persons'][action.data.base_id] = action.data.data;
        break;

      case ActionTypes.DASHBOARD_REQUEST_USERS_SUCCESS:
        _store['users'] = action.data;
        break;

      case ActionTypes.DASHBOARD_REQUEST_USER_SUCCESS:
        _store['user'] = action.data.data;
        break;

      case ActionTypes.DASHBOARD_REQUEST_TYPES_SUCCESS:
        _store['types'] = action.data.data.types;
        break;

      case ActionTypes.DASHBOARD_REQUEST_FORM_SUCCESS:
        _store['form'] = action.data;
        break;

      case ActionTypes.DASHBOARD_REQUEST_ERROR_401:
        _store['info'] = action.data;
        break;

      default:
        return true;
    }

    UserStore.emitChange();

    return true; // No errors. Needed by promise in Dispatcher.
  })
});

module.exports = UserStore;

function makeArray(data){

  var params = {};
  data.map(function(item){
    if(params[item['name']]){
      params[item['name']] = findByValue(data, 'name', item['name']);
    }else{
      params[item['name']] = item['value'];
    }

  });
  return params;
}

function findByValue(array, key, value){
  var result = {};
  var res = [];

  result = array.filter(function(item){
    if(item[key] === value){
      res.push(item['value']);
    }
  });

  return res;
}

function pick(data, key){

  var results = [];

  data.map(function(item){
    results.push(item[key]);
  });

  return results;

}