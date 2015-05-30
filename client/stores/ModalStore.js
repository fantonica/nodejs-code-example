var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var ModalStore = merge(EventEmitter.prototype, {

  openModal: function(){
    this.emit(CHANGE_EVENT, {show: true});
  },

  closeModal: function(){
    this.emit(CHANGE_EVENT, {show: false});
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
    var action = payload.action;

//    switch (action.actionType) {
//      default:
//        return true;
//    }

    return true; // No errors. Needed by promise in Dispatcher.
  })

});

module.exports = ModalStore;
