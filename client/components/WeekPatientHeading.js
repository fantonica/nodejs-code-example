var React = require('react');
var moment = require('moment');
var PatientActions = require('../actions/PatientActions');
var PatientStore = require('../stores/PatientStore');
var WeekPatientListing = require('./WeekPatientListing');
var UserActions = require('../actions/UserActions');
var UserStore = require('../stores/UserStore');
var $ = require('jquery');

function queryWeek(){
  var match = window.location.search.match(/(\?|&)week\=([^&]*)/);
  return match != null ? decodeURIComponent(match[2]) : moment().week();
}

function queryGroup(){
  var match = window.location.search.match(/(\?|&)group\=([^&]*)/);
  return match != null ? decodeURIComponent(match[2]) : "Gruppe 1";
}

$(window).focus(function() {
  PatientActions.fetchWeek(moment().isoWeek());
});

var WeekPatientHeading = React.createClass({
  getInitialState: function(){
    return {
      week: queryWeek(),
      group: queryGroup(),
      groupName: null
    }
  },

  tick: function(){
    var hour = moment().hour();
    var minute = moment().minute();
    var week = moment().isoWeek();

    if( (hour == 7 && minute == 0) || (hour == 15 && minute == 15) || (hour == 22 && minute == 45)){
      PatientActions.fetchWeek(week);
    }
  },

  getState: function() {
    return {
      week: PatientStore.getWeek(),
      groupName: PatientStore.getGroupName(),
      options: PatientStore.getOptions()
    };
  },

  componentWillMount: function() {
    PatientStore.addChangeListener(this._onChange);
  },

  componentDidMount: function(){
    UserActions.loggedin();
    var self = this;

    setTimeout(function(){
      PatientActions.fetchWeek(self.state.week);
    }, 1000)

    this.interval = setInterval(function(){
      self.tick()
    }, 1000 * 60);
  },

  _onChange: function() {
    this.setState(this.getState());
    //if(UserStore.isLoggedin()){
    //
    //}else{
    //  UserStore.redirect('/admin/login')
    //}
  },
  render: function(){
    var week = moment().week();

    return (
      <div className="row day-navigation">
        <div className="weekhead" style={{padding: '0 10px'}}>
          <div className="week">{this.state.groupName ? this.state.groupName + " - Uge " + this.state.week : null}</div>
        </div>
        <div className="day-listing">
          {!this.state.groupName ? <div className="loading">Loading...</div> : <WeekPatientListing week={this.state.week} options={this.state.options}/>}
        </div>
      </div>
    );
  }
});

module.exports = WeekPatientHeading;