var React = require('react');
var UserList = require('./components/UserList');
var AddNewUser = require('./components/admin/AddNewUser');
var EditUser = require('./components/admin/EditUser');

document.getElementById('dashboard-users') ? React.render(<UserList />, document.getElementById('dashboard-users')) : null;
document.getElementById('add-new-user') ? React.render(<AddNewUser />, document.getElementById('add-new-user')) : null;
document.getElementById('edit-user') ? React.render(<EditUser />, document.getElementById('edit-user')) : null;