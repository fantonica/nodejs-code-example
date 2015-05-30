var React = require('react');
var WeekHeading = require('./components/WeekHeading');
var WeekListing = require('./components/WeekListing');

React.render(<WeekHeading />, document.getElementById('employee-weekheading'));
React.render(<WeekListing />, document.getElementById('employee-weeklisting'));