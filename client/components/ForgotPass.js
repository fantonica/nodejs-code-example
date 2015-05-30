var React = require('react');
var UserActions = require('../actions/UserActions');
var UserStore = require('../stores/UserStore');
var FormControl = require('./untiles/Form');

ForgotPassForm = React.createClass({
  render: function(){
    return(
      <div className="login">
        <div className="panel panel-default">
          <div className="panel-heading"><h3 className="panel-title"><strong>Reset password </strong></h3></div>
          <div className="panel-body">
            <FormControl action="/api/admin/user/signin" method="post" redirect="/admin/login">
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" ref="email" name="email" placeholder="Enter email" />
              </div>
              <button type="submit" className="btn btn-sm btn-default">Reset</button>
            </FormControl>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = ForgotPassForm;