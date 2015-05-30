/**
 * @jsx React.DOM
 */

var React = require('react');
var ViewsActions = require('../actions/ViewsActions');
var ViewsStore = require('../stores/ViewsStore');
var ViewsListingItem = require('./ViewsListingItem');

var ViewsListing = React.createClass({

    getInitialState: function() {
        return {
            views: []
        };
    },

    getState: function() {
        return {
            views: ViewsStore.getViews()
        };
    },

    componentWillMount: function() {
        ViewsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        ViewsActions.fetchViews();
    },

    componentWillUnmount: function() {
        ViewsStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(this.getState());
    },

    render: function() {
        var listing = this.state.views.length ? this.state.views.map(function(view, idx){
            return <ViewsListingItem key={idx} data={view} />;
        }) : <div className="loading">Loading...</div>;

        return (
            <ul className="views-listing">
                {listing}
            </ul>
        );
    }

});

module.exports = ViewsListing;