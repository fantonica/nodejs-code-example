var React = require('react');
var moment = require('moment');
var PatientActions = require('../actions/PatientActions');
var PatientStore = require('../stores/PatientStore');
var $ = require('jquery');
var UserActions = require('../actions/UserActions');
var UserStore = require('../stores/UserStore');

function queryDay() {
    var match = window.location.href.match(/[?&]day(?:_id)?=([0-9-]{10})/);
    return match && match[1] ? match[1] : moment().format('YYYY-MM-DD');
};

$(window).focus(function() {
  PatientActions.fetchDay(moment().format('YYYY-MM-DD'));
});

var DayHeading = React.createClass({

    getInitialState: function() {
        return {
            day: queryDay(),
            fixed: window.scrollY != 0
        };
    },

    getState: function() {
        return {
            day: moment(PatientStore.getDay()).format('YYYY-MM-DD')
        };
    },

    tick: function(){

      var hour = moment().hour();
      var minute = moment().minute();

      if( (hour == 7 && minute == 0) || (hour == 15 && minute == 15) || (hour == 22 && minute == 45)){
        PatientActions.fetchDay(moment().format('YYYY-MM-DD'));
      }
    },

    componentWillMount: function() {
        PatientStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        UserActions.loggedin();
        PatientActions.fetchDay(this.state.day);
        window.onscroll = function() {
            if (!this.state.fixed && window.scrollY > 0) this.setState({ fixed: true });
            if (this.state.fixed && window.scrollY == 0) this.setState({ fixed: false });
        }.bind(this);

      this.interval = setInterval(this.tick, 1000 * 60);

    },

    componentWillUnmount: function() {
        PatientStore.removeChangeListener(this._onChange);
        clearInterval(this.interval);
    },

    _onChange: function() {
        this.setState(this.getState());
        //if(UserStore.isLoggedin()){
        //
        //}else{
        //  UserStore.redirect('/admin/login')
        //}
    },

    render: function() {
        var date = moment(this.state.day);
        return (
            <div className="row day-navigation">
                <div className="col16"></div>
            </div>
        );
    }

});

module.exports = DayHeading;