var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionTypes = require('../constants/AppConstants').ActionTypes;
var $ = require('jquery');
var Сropper = require('cropper');
var merge = require('react/lib/merge');
var _ = require('lodash')
var CHANGE_EVENT = 'change';
var UPLOAD_EVENT = 'upload';
var PROGRESS_EVENT = 'progress.upload';
var REMOVE_IMG = 'removeImg';
var _alphabeticalEmployeesList = null;
var _employeesListRaw = null;
var _searchQuery = null;
var _firstSurnameLetterArray = null;
var _filterLetter = null;
var imgUrl = null;
var imgId = null;
var progress = 0;

var EmployeeStore = merge(EventEmitter.prototype, {

  getEmployeesListRaw: function() {
    return _employeesListRaw
  },

  getAlpabeticalList: function() {
    return _alphabeticalEmployeesList
  },

  getSurnamesList: function() {
    return _firstSurnameLetterArray
  },

  getUploadImageUrl: function(){
    return imgUrl;
  },

  setFilterByLetter: function(value){
    _filterLetter = value;
    this.emit(CHANGE_EVENT);
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addUploadListener: function(callback) {
    this.on(UPLOAD_EVENT, callback);
  },

  removeUploadListener: function(callback){
    this.removeListener(UPLOAD_EVENT, callback);
  },

  getProgress: function(){
    return Math.round(progress);
  },

  onProgress: function(callback){
    this.on(PROGRESS_EVENT, callback);
  },

  onRemoveImg: function(callback){
    this.on(REMOVE_IMG, callback, imgId);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  catImage: function(canvas, image){
      catImage(canvas, image)
  },

  dispatcherIndex: AppDispatcher.register(function(payload) {
    var key, _tmp, action = payload.action;

    switch (action.actionType) {
      case ActionTypes.EMPLOYEE_LIST_REQUEST:
        _employeesListRaw = action.employeesList
        _alphabeticalEmployeesList = employeesArray(_employeesListRaw)
        _firstSurnameLetterArray = createSurnameLetterArray(action.employeesList)
        EmployeeStore.emitChange();
        break;
      case ActionTypes.EMPLOYEE_LIST_SEARCH:
        _searchQuery = action.searchQuery
        _tmp = filterEmployeesList(_employeesListRaw, _searchQuery)
        _alphabeticalEmployeesList = employeesArray(_tmp)
        _firstSurnameLetterArray = createSurnameLetterArray(_tmp)
        _tmp = null
        EmployeeStore.emitChange();
        break;
      case ActionTypes.EMPLOYEE_LIST_LETTER:
        _searchQuery = action.searchQuery
        _tmp = filterEmployeesByLetter(_employeesListRaw, _searchQuery)
        _alphabeticalEmployeesList = employeesArray(_tmp)
        _tmp = null
        EmployeeStore.emitChange();
        break;
      case ActionTypes.EMPLOYEE_UPLOAD_IMAGE:
        imgUrl = action.data.data.imgUrl;
        EmployeeStore.emit(UPLOAD_EVENT);
        break;
      case ActionTypes.EMPLOYEE_UPLOAD_PROGRESS:
        progress = action.data;
        EmployeeStore.emit(PROGRESS_EVENT);
        break;
      case ActionTypes.EMPLOYEE_REMOVE_IMAGE:
        imgId = action.data.id
        EmployeeStore.emit(REMOVE_IMG);
        break;
      default:
        return true;
    }

    return true; // No errors. Needed by promise in Dispatcher.
  })
});

module.exports = EmployeeStore;

function main(result, employess) {

  var firstLetter = getFirstLetter()
  var createObjectPartial = _.partial(createObject, result)
  var getResultedObject = _.compose(createObjectPartial, firstLetter)
  return getResultedObject(result, employess)
}

function getFirstLetter() {
  return _.compose(firstLetter, getFirstName, getEmployee)
}

function getFirstName(employees) {
  return employees.first_name
}

function getEmployee(result, employee) {
  return employee
}

function firstLetter(name) {
  return name && typeof name == 'string' && name[0].toUpperCase()
}

function createObject(obj, key) {
  var retobj = obj || {}
  retobj[key] = []
  return retobj
}

function createAlphabeticalList(list) {
  return _.reduce(list, main, {})
}

function appendNamesToList(employeesList, alphabeticalList) {
  _.each(alphabeticalList, function(key, value) {
    alphabeticalList[value] = employeesList.filter(function(employess) {
      return value == firstLetter(employess.initials)
    })
  });
  return alphabeticalList
}

function convertObjectToArray(list) {
  return Object.keys(list).map(function(key) {

    // Filtered employees by first letter in first name

    var results = list[key].filter(function(employess){
      if(_filterLetter){
        return employess.initials[0].toLowerCase() === _filterLetter.toLowerCase()
      }else{
        return employess.initials[0].toLowerCase() === key.toLowerCase()
      }
    });

    return {
      letter: key,
      employees: results.length > 0 ? results : false
    }
  })
}




function createSurnameLetterArray(list) {
  var letterList = _.reduce(list, main, {})
  return Object.keys(letterList).sort()
}

function employeesArray(rawEmployeesList) {


  return _.sortBy(convertObjectToArray(
    appendNamesToList(rawEmployeesList, createAlphabeticalList(rawEmployeesList))
  ), ['letter'])
}

function filterEmployeesList(list, query) {
  var queryReg = new RegExp("^" + query, 'ig')
  return list.filter(function(user) {
    return queryReg.test(user.initials.toLowerCase())
  });
}

function filterEmployeesByLetter(list, query) {
  return list.filter(function(user) {
    return query == null || user.initials[0].toLowerCase() === query.toLowerCase()
  })
}

function catImage(canvas, image){

  var reader = new FileReader();

  reader.onload = function(e){
    var bitmap = e.target.result;

    $(canvas).find('> img').cropper({
      minWidth: 160,
      minHeight: 160,
      aspectRatio: 1
    });

  }.bind(this);

  reader.readAsDataURL(image);

}