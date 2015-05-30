var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var _store = {
    views: {}
};

var ViewsStore = merge(EventEmitter.prototype, {

    getViews: function() {
        return _store.views;
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
            case ActionTypes.DASHBOARD_REQUEST_VIEWS:

                break;
            case ActionTypes.DASHBOARD_REQUEST_VIEWS_SUCCESS:
                _store.views = action.data;
                break;

            case ActionTypes.DASHBOARD_REQUEST_VIEWS_DELETED:

                break;

            default:
                return true;
        }
        ViewsStore.emitChange();
        return true; // No errors. Needed by promise in Dispatcher.
    })
});

module.exports = ViewsStore;