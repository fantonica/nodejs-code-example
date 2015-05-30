var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var _store = {
    day: null,
    shifts: {},
    options: {}
};

var PatientStore = merge(EventEmitter.prototype, {

    getShifts: function() {
        return _store.shifts;
    },

    getDay: function() {
        return _store.day;
    },

    getWeek: function(){
        return _store.week;
    },

    getOptions: function(){

        return _store.options
    },

    getGroupName: function(){
        return _store.group.name;
    },

    getWeekShifts: function(){
      return _store.group.shifts;
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
            case ActionTypes.PATIENT_REQUEST_DAY:

                break;
            case ActionTypes.PATIENT_REQUEST_DAY_SUCCESS:
                _store.day = action.data.day;
                _store.shifts.dag = action.data.dag;
                _store.shifts.aften = action.data.aften;
                _store.shifts.nat = action.data.nat;
                _store.options = action.data._options;
                break;

            case ActionTypes.PATIENT_REQUEST_WEEK_SUCCESS:
                _store.options = action.data._options;
                _store.week = action.data.week;
                _store.group = action.data.groups[0];
                break;
            default:
                return true;
        }
        PatientStore.emitChange();
        return true; // No errors. Needed by promise in Dispatcher.
    })
});

module.exports = PatientStore;