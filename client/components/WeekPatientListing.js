var React = require("react");
var moment = require("moment");
var da = require('moment/locale/da');
var WeekPatientDay = require('./WeekPatientDay');
var PatientStore = require('../stores/PatientStore');

var WeekPatientDays = React.createClass({

  render: function(){

    var days = [], daysAhead = this.props.options.days_ahead || 4;

    var itemheight = Math.floor((window.innerHeight) / daysAhead) - 16;

    var itemwidth = Math.floor(window.innerWidth - itemheight - 10)


    for (var i = 0; i < daysAhead; i++){
      var name = moment().isoWeekday(moment().day() + i).format('dddd');

      days.push(<WeekPatientDay week={this.props.week} options={this.props.options} name={name} day={i} itemheight={itemheight} daycolumnwidth={itemwidth}/>);
    }

    return (
      <ul>
        {days}
      </ul>
    )
  }
});

module.exports = WeekPatientDays;