var React = require("react");
var FormControl = require("../untiles/Form");
var UnitList = require("./UnitsList");

var AddNewUser = React.createClass({
  componentDidMount: function(){

    setTimeout((function(_this){
      return function(){
        _this.refs.email.getDOMNode().value = "";
        _this.refs.email.getDOMNode().setAttribute("autocomplete", "off");

        _this.refs.password.getDOMNode().value = "";
      }
    })(this), 500);


  },
  render: function(){
    var create = {
      accepted: ['create']
    };

    return (
      <div className="col col6 center">
        <FormControl action="/api/admin/user/push" method="post" redirect="/admin/users">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" className="form-control" name="first_name" placeholder="Enter First name" />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" className="form-control" name="second_name" placeholder="Enter Last name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="text" ref="email" className="form-control" name="email" placeholder="Enter email" autocomplete="off"/>
          </div>
          <div className="form-group">
            <label>User Password</label>
            <input type="password" ref="password" className="form-control" name="password" placeholder="Password" autocomplete="off"/>
          </div>

          <UnitList unitsChecked="create" />

          <button type="submit" className="btn btn-sm btn-default">Create</button>
        </FormControl>
      </div>
    )
  }
});

module.exports = AddNewUser;