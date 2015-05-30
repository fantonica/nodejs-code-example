var React = require("react");
var FormControl = require("../untiles/Form");
var UserActions = require("../../actions/UserActions");
var UserStore = require("../../stores/UserStore");
var UnitList = require("./UnitsList");

function queryId(){
  var match = window.location.search.match(/(\?|&)id\=([^&]*)/);
  return match != null ? decodeURIComponent(match[2]) : null;
}

var EditUser = React.createClass({

  getInitialState: function(){
    return {
      _id: queryId()
    }
  },

  _getState: function(){
    return UserStore.getUser()
  },

  componentWillMount: function(){
     UserStore.addChangeListener(this._onChange);
  },

  componentDidMount: function(){
    UserActions.fetchUsersById(this.state._id)
  },

  _onChange: function(){
    this.setState(this._getState());
  },

  handleChange: function(event) {

    var obj = {};

    obj[event.target.name] = event.target.value;

    this.setState(obj);
  },

  render: function(){
    var redirect ="/admin/edit?id=" + this.state._id
    return (
      <div className="col col6 center edit-user">
        <FormControl action="/api/admin/user/push" method="post" redirect={redirect}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" className="form-control" name="first_name" placeholder="Enter First name" onChange={this.handleChange} value={this.state.first_name}/>
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" className="form-control" name="second_name" placeholder="Enter Last name" onChange={this.handleChange} value={this.state.second_name} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" name="email" placeholder="Enter email" onChange={this.handleChange} value={this.state.email}/>
          </div>
          <div className="form-group">
            <label>User Password</label>
            <input type="password" className="form-control" name="password" placeholder="Password" />
          </div>

          <UnitList unitsChecked={this.state.units} />

          <input type="hidden" name="c_id" value={this.state._id} />

          <button type="submit" className="btn btn-sm btn-default">Update</button>
        </FormControl>
      </div>
      )
  }
});

module.exports = EditUser;