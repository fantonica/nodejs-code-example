/**
 * @jsx React.DOM
 */

var React = require('react');
var moment = require('moment');
var PatientActions = require('../actions/PatientActions');

function parse(val) {
  var result = false,
    tmp = [];
  location.search
    //.replace ( "?", "" )
    // this is better, there might be a question mark inside
    .substr(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    });
  return result;
}

var DayListingItem = React.createClass({
    getInitialState: function(){
      return {
        show: true
      }
    },

    tick: function(){
      this.checkTime()
    },

    checkTime: function(){
        var hour = moment().hour();
        var minute = moment().minute();

        var atMoment = moment(new Date()).valueOf();

        var startShift = this.props.data.shift_start;
        var endShift = this.props.data.shift_end;

        this.setState({
            overlay: atMoment < startShift
        });

        if(atMoment > endShift){
            this.refresh()
        }

    },

    refresh: function(){
        PatientActions.fetchDay(this.props.data.day);
    },

    componentWillMount: function() {
      clearInterval(this.interval);
    },

    componentDidMount: function() {
        this.checkTime();
        this.interval = setInterval(this.tick, 1000);
    },
    render: function() {

        var name = this.props.options.show_fullname ? this.props.data.initials : this.props.data.initials.split(/\s/).map(function(w, i){
          if (!i) return w;
          return w.substring(0, 1).toUpperCase() + '.';
        }).join(' ');

        var className = '', overlay = this.state.overlay ? 'overlay in' : 'overlay';

        var labelColor = '';

        var w = this.props.width + 'px';
        var h = this.props.height + 'px'
        var img = this.props.data.image_url || '/img/no_photo.png';

        var shiftBegin = moment.utc(this.props.data.shift_start).zone('+0100').format("HH.mm");
        var shiftFinish = moment.utc(this.props.data.shift_end).zone('+0100').format("HH.mm");

        if(parseFloat(shiftBegin) > 6.00){
          labelColor = ' shift-day';
        }
        if(parseFloat(shiftBegin) > 12.00){
          labelColor = ' shift-evening';
        }
        if(parseFloat(shiftBegin) > 21.00 || parseFloat(shiftBegin) < 6.00){
          labelColor = ' shift-night';
        }

        className += !this.props.options.show_photos ? 'no-photo' : '';

        className += labelColor;

        className += " table-cell";

        return (
            <li className={className}>
                <div className="inner" style={{maxWidth: 115, margin: 'auto', height: h}}>
                  {this.props.options.show_photos ? <div className={overlay} style={{width: this.props.maxWidth < 150 ? this.props.maxWidth - 50 : this.props.maxWidth}}>
                    <img src={img} alt="" />
                  </div> : null}

                  <div style={{maxWidth: this.props.maxWidth < 150 ? this.props.maxWidth - 50 : this.props.maxWidth, marginLeft: 'auto', marginRight: 'auto'}} className={"shift" + (this.props.maxWidth < 80 ? " shift-small" : "") + labelColor}>
                      {shiftBegin} - {shiftFinish}
                      <strong className={"name" + (this.props.maxWidth < 115 ? " name-small" : "")}>{name}
                        {this.props.options.show_skills && this.props.data.skills ? <span className="skill">{this.props.data.skills}</span> : null}
                      </strong>
                  </div>
                </div>
            </li>
        );
    }

});

module.exports = DayListingItem;