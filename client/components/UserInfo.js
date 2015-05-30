var React = require('react');
var FormControl = require('./untiles/Form');
var UserStore = require('../stores/UserStore');

var UserInfo = React.createClass({
  getInitialState: function(){
    return {
      first: this.props.user.first_name,
      second: this.props.user.second_name,
      email: this.props.user.email,
      editMode: false,
      submit: false
    }
  },

  edit: function(e){
    e.preventDefault();

    this.setState({
      editMode: true
    });
  },

  clickHeandler: function(e){
    this.setState({
      submit: true
    });

    UserStore.formSubmit();
  },

  render: function(){
    return (
      <div className="user-info">
        {this.state.editMode ? <FormControl action="/api/admin/user/update" method="post" submit={this.state.submit} redirect="/admin/users">
            <div className="form-group">
              <label>First name: </label>
              <input type="text" className="form-control" defaultValue={this.state.first} name="first_name" />
            </div>

            <div className="form-group">
              <label>Second name: </label>
              <input type="text" className="form-control" defaultValue={this.state.second} name="second_name" />
            </div>

            <div className="form-group">
              <label>Email: </label>
              <input type="email" className="form-control" defaultValue={this.state.email} name="email" />
            </div>

            <div className="form-group">
              <label>Password: </label>
              <input type="password" className="form-control" placeholder="New Password" name="password" />
            </div>

            <button type="submit" className="btn btn-sm btn-default" onClick={this.clickHeandler}>Save </button>

          </FormControl> : <div>

            <div>First name: <strong>{this.state.first}</strong></div>
            <div>Second name: <strong>{this.state.second}</strong></div>
            <div>E-mail: <strong>{this.state.email}</strong></div>
            <div className="text-center" style={{marginTop: '20px'}}>
              <a href="#" className="button" onClick={this.edit}>Edit</a>
            </div>
          </div>
        }

      </div>
    );
  }
});

module.exports = UserInfo;