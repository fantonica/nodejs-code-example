/**
 * @jsx React.DOM
 */

var React = require('react');
var moment = require('moment');
var EmployeeStore = require('../stores/EmployeeStore');
var WeekListingGroup = require('./WeekListingGroup');

var WeekListing = React.createClass({

    getInitialState: function() {
        return {
            week: moment().format('w'),
            groups: []
        };
    },

    getState: function() {
        return {
            week: EmployeeStore.getWeek(),
            groups: EmployeeStore.getWeekShifts(EmployeeStore.getWeek()) || []
        };
    },

    componentWillMount: function() {
        EmployeeStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        EmployeeStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(this.getState());
    },

    render: function() {

        var listing = this.state.groups.length ? this.state.groups.map(function(group, idx){
            return <WeekListingGroup key={idx} data={group} />;
        }) : <div className="loading">Loading...</div>;

        return (
            <div>{listing}</div>
        );
    }

});

module.exports = WeekListing;