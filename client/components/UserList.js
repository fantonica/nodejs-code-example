var React = require("react");
var UserActions = require("../actions/UserActions");
var UserStore = require("../stores/UserStore");
var Modal = require("./untiles/Modal");

var UserItem = React.createClass({

  getInitialState: function(){
    return {
      confirmModal: false
    }
  },

  confirm: function(e){
    e.preventDefault();

    this.setState({
      confirmModal: true
    });
  },

  render: function(){

    var editLink = "/admin/edit?id=" + this.props.data._id;

    return (
      <li className="row">
        <div className="col9">
          <strong>{this.props.data.role}</strong>
          <strong>{this.props.data.first_name}</strong>
          <span>{this.props.data.email}</span>
        </div>
        <div className="col3 collapsed actions">
          <a href={editLink} className="col4">Edit</a>
          <a href="#" onClick={this.confirm} className="col4">Delete</a>
        </div>
        {this.state.confirmModal ? <Modal show={this.state.confirmModal} /> : null}

      </li>
    )
  }
});

var UserList = React.createClass({

  getInitialState: function(){
    return {
      users: [],
      fetchEnd: false
    }
  },

  _getState: function(){
    return {
      users: UserStore.getUserList(),
      fetchEnd: true
    }
  },

  componentWillMount: function(){
    UserStore.addChangeListener(this._onChange);
  },

  componentDidMount: function(){
    this.setState({
      fetchEnd: false
    });

    UserActions.fetchUsers();
  },

  _onChange: function(){
    this.setState(this._getState());
  },

  render: function () {

    var list = [];

    list = this.state.users && this.state.users.length ? this.state.users.map(function(item){
      return <UserItem data={item} />
    }) : this.state.fetchEnd ? <div className="loading">There is nothing...</div> : <div className="loading">Loading...</div>;


    return (
      <ul className="views-listing">{list}</ul>
    )
  }
});

module.exports = UserList;