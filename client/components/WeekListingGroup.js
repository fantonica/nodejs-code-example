/**
 * @jsx React.DOM
 */

var React = require('react');
var WeekListingItem = require('./WeekListingItem');

var WeekListingGroup = React.createClass({

    render: function() {
        var listing = this.props.data.shifts ? this.props.data.shifts.map(function(week, idx){
            return <WeekListingItem key={idx} data={week} />;
        }) : null;

        return (
            <ul className="week-listing">
                <li className="row head">
                    <div className="col16">
                        <span className="group">{this.props.data.name}</span>
                    </div>
                </li>
                {listing}
            </ul>
        );
    }

});

module.exports = WeekListingGroup;