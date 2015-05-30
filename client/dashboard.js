var React = require('react');
var ViewsListing = require('./components/ViewsListing');
var NavBar = require('./components/NavBar');
var CreateView = require('./components/admin/CreateView');
var EditView = require('./components/admin/EditView');

React.render(<NavBar />, document.getElementById('nav-bar'));
document.getElementById('dashboard-viewslisting') ? React.render(<ViewsListing />, document.getElementById('dashboard-viewslisting')) : null;
document.getElementById('dashboard-newview') ? React.render(<CreateView />, document.getElementById('dashboard-newview')) : null;
document.getElementById('dashboard-editview') ? React.render(<EditView />, document.getElementById('dashboard-editview')) : null;