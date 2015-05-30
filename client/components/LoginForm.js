var React = require('react');
var UserActions = require('../actions/UserActions');
var UserStore = require('../stores/UserStore');
var FormControl = require('./untiles/Form');

var LoginForm = React.createClass({

  submit: function(e){
    e.preventDefault();

    var data = {};

    data['email'] = this.refs.email.getDOMNode().value;
    data['password'] = this.refs.password.getDOMNode().value;

    UserActions.login(data);

  },

  componentWillMount: function(){
    UserStore.addChangeListener(this._onChange);
  },

  _onChange: function(){
  },

  render: function(){
    var redirect_url = localStorage.getItem("prev_url") || "/admin/dashboard";

    redirect_url = redirect_url == "/admin/login" ? "/admin/dashboard" : redirect_url;

    return(
      <div className="login">
        <div className="panel panel-default">
          <div className="panel-heading"><h3 className="panel-title"><strong>Sign In </strong></h3></div>
          <div className="panel-body">
            <FormControl action="/api/admin/user/signin" method="post" redirect={redirect_url}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" ref="email" name="email" placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control" ref="password" name="password" placeholder="Password" />
              </div>
              <div className="text-right">
                <a href="/admin/forgot_password">Forgot password?</a>
              </div>
              <button type="submit" className="btn btn-sm btn-default">Sign in</button>
            </FormControl>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = LoginForm;
