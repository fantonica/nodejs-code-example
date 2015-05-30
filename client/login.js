var React = require('react');
var LoginForm = require('./components/LoginForm');
var ForgotPass = require('./components/ForgotPass');

document.getElementById('login-form') ? React.render(<LoginForm />, document.getElementById('login-form')) : null;
document.getElementById('forgot-password-form') ? React.render(<ForgotPass />, document.getElementById('forgot-password-form')) : null;