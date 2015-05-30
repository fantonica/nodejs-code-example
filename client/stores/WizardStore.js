var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';
var ACCORDION_EVENT = 'change.accordion';
var NEXT_EVENT = 'change.next.page';
var PREV_EVENT = 'change.prev.page';
var VIEW_EVENT = 'change.view';

var _store = {
  form: null
};

var view = null;

var WizardStore = merge(EventEmitter.prototype, {

  isSuccess: function(){
    return _store.form ? _store.form.success : false;
  },

  getData: function(){
    return _store.form ? _store.form.data : [];
  },

  getView: function(){
    return view;
  },

  nextPage: function(){
    this.emit(NEXT_EVENT);
  },

  prevPage: function(){
    this.emit(PREV_EVENT);
  },

  collapsed: function(){
    this.emit(ACCORDION_EVENT);
  },

  emitEvent: function(event){
    this.emit(event)
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addNextPageListener: function(callback){
    this.on(NEXT_EVENT, callback);
  },

  addViewListener: function(callback){
    this.on(VIEW_EVENT, callback);
  },

  addPrevPageListener: function(callback){
    this.on(PREV_EVENT, callback);
  },

  addAccordionListener: function(callback){
    this.on(ACCORDION_EVENT, callback);
  },

  removeAccordionListener: function(callback) {
    this.removeListener(ACCORDION_EVENT, callback);
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

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var key, action = payload.action;

    switch (action.actionType) {

      case ActionTypes.DASHBOARD_REQUEST_FORM_SUCCESS:
        _store['form'] = action.data;
        WizardStore.nextPage();
        break;

      case ActionTypes.DASHBOARD_REQUEST_VIEW_SUCCESS:
        view = action.data;
        WizardStore.emit(VIEW_EVENT);
        break;

      default:
        return true;
    }

    WizardStore.emitChange();

    return true; // No errors. Needed by promise in Dispatcher.
  })
});

module.exports = WizardStore;