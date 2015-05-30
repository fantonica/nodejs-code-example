/**
 * @jsx React.DOM
 */

var React = require('react');
var moment = require('moment');
var da = require('moment/locale/da');
var PatientStore = require('../stores/PatientStore');
var DayListingGroup = require('./DayListingGroup');

moment.locale('da');

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function queryDay() {
  var match = window.location.href.match(/[?&]day(?:_id)?=([0-9-]{10})/);
  return match && match[1] ? match[1] : moment().format('YYYY-MM-DD');
};

var DayListing = React.createClass({

    getInitialState: function() {
        return {
            day: moment().format('YYYY-MM-DD'),
            currentDay: queryDay(),
            shifts: {}
        };
    },

    getState: function() {
        return {
            day: PatientStore.getDay(),
            shifts: PatientStore.getShifts(),
            options: PatientStore.getOptions()
        };
    },

    componentWillMount: function() {
        PatientStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PatientStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(this.getState());
    },

    render: function() {

        var self = this;
        var groups = {};

        var order = {};

        for(shift in this.state.shifts){
          var _item = this.state.shifts[shift];
          order[_item.order] = shift
        }

        var longest = {
            dag: 0,
            aften: 0,
            nat: 0
        };

        this.state.shifts.dag && this.state.shifts.dag.groups.forEach(function(group){
            if (!groups[group.name]) {
                groups[group.name] = {};
            }
            groups[group.name].dag = group.shifts;
            if (group.shifts.length > longest.dag) longest.dag = group.shifts.length;
        });

        this.state.shifts.aften && this.state.shifts.aften.groups.forEach(function(group){
            if (!groups[group.name]) {
                groups[group.name] = {};
            }
            groups[group.name].aften = group.shifts;
            if (group.shifts.length > longest.aften) longest.aften = group.shifts.length;
        });

        this.state.shifts.nat && this.state.shifts.nat.groups.forEach(function(group){
            if (!groups[group.name]) {
                groups[group.name] = {};
            }
            groups[group.name].nat = group.shifts;
            if (group.shifts.length > longest.nat) longest.nat = group.shifts.length;
        });

        if (!longest.dag) longest.dag = 1;
        if (!longest.aften) longest.aften = 1;
        if (!longest.nat) longest.nat = 1;

        var length = longest.dag + longest.aften + longest.nat;
        var itemheight = Math.floor((window.innerHeight - 48 - Object.keys(groups).length * 4) / Object.keys(groups).length);
            itemheight = itemheight > 172 ? 172 : itemheight;
        var itemwidth = Math.floor((window.innerWidth - 70 - itemheight) / length);
        var dateWidth = itemheight;
        var dagwidth = longest.dag * itemwidth;
        var aftenwidth = longest.aften * itemwidth;
        var natwidth = longest.nat * itemwidth;

        var grouplisting = [];
        var idx = 0;

        var keys = [];

        for(var key in groups){
          if (groups.hasOwnProperty(key)) {
            keys.push(key);
          }
        }

        keys.sort();
        for (var i in keys) {
          var name = keys[i];
          grouplisting.push(<DayListingGroup
              key={idx++}
              name={name}
              data={groups[name]}
              itemwidth={itemwidth}
              itemheight={itemheight}
              dagwidth={dagwidth}
              aftenwidth={aftenwidth}
              natwidth={natwidth}
              order={order}
              day={self.state.day}
              options={self.state.options}
            />
          );
        }

        var date = moment(this.state.currentDay);
        var head = [];

        for(i in order){
            var w = 0

            switch (order[i]){
                case "dag" :
                    w = dagwidth;
                    break;
                case "aften" :
                    w = aftenwidth;
                    break;
                case "nat" :
                    w = natwidth;
                    break;

            }

            head.push(<div className="table-cell">{order[i].capitalize()}</div>)
        }

        return (
            <div className="table center">
                <div className="dayhead table-head">
                  <div className="table-row">
                    <div className="day table-cell"><strong>{date.format('dddd, [D]. D. MMM.').capitalize()}</strong></div>
                    {head}
                  </div>
                </div>
                <ul className="day-listing table-body">
                    {grouplisting.length ? grouplisting : <div className="loading">Loading...</div>}
                </ul>
            </div>
        );
    }

});

module.exports = DayListing;