var React = require('react');
var DayHeading = require('./components/DayHeading');
var DayListing = require('./components/DayListing');

React.render(<DayHeading />, document.getElementById('patient-dayheading'));
React.render(<DayListing />, document.getElementById('patient-daylisting'));