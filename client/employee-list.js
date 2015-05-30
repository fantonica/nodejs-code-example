var React = require('react');
var EmployeesSearch = require('./components/EmployeesSearch');
var EmployeesList = require('./components/EmployeesList');
var EmployeesSurnameList = require('./components/EmployeeSurnameList');
var NavBar = require('./components/NavBar');

React.render(<NavBar />, document.getElementById('nav-bar'));
React.render(<EmployeesSearch />, document.querySelector('.employees-search'));
React.render(<EmployeesList />, document.querySelector('.employees-table'));
React.render(<EmployeesSurnameList />, document.querySelector('.employees-surname-list'));
