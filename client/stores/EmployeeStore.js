var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var _store = {
    week: null,
    shifts: {}
};

var _searchQuery = null;
var _searchResults = null;

var EmployeeStore = merge(EventEmitter.prototype, {

    getWeekShifts: function(week) {
      _searchResults = filterShifts(_store.shifts[week], _searchQuery);
        return _searchResults ? _searchResults : _store.shifts[week];
    },

    getWeek: function() {
        return _store.week;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    dispatcherIndex: AppDispatcher.register(function(payload) {
        var key, action = payload.action;

        switch (action.actionType) {
            case ActionTypes.EMPLOYEE_REQUEST_WEEK:
                _store.week = null;
                _store.shifts = [];
                break;
            case ActionTypes.EMPLOYEE_REQUEST_WEEK_SUCCESS:
                _store.week = action.data.week;
                _store.shifts[action.data.week] = action.data.groups;
                break;

            case ActionTypes.EMPLOYEE_LIST_SEARCH:
              _searchQuery = action.searchQuery;
              EmployeeStore.emitChange();
            break;

            default:
                return true;
        }
        EmployeeStore.emitChange();
        return true; // No errors. Needed by promise in Dispatcher.
    })
});

module.exports = EmployeeStore;

function filterShifts(data, query){

  if(!query || query == ''){
    return data
  }

  var queryReg = new RegExp(query, 'ig');

  var result = [];

  data.map(function(group){

    var _res = [];
    var groupFiltered = {
      name: group.name,
      shifts: []
    };

    group.shifts.map(function(shift){

      queryReg.test(shift.user.initials) ? groupFiltered.shifts.push(shift) : null

    });

    groupFiltered.shifts.length > 0 ? result.push(groupFiltered) : null;

  });

  return result;

}