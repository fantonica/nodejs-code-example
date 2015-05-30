var React = require("react");
var Modal = require("./untiles/Modal");
var UserStore = require('../stores/UserStore');
var UserActions = require('../actions/UserActions');
var UserInfo = require("./UserInfo");
var ModalStore = require('../stores/ModalStore');

var NavBar = React.createClass({

  getInitialState: function(){
    return {
      active: null,
      pathname: location.pathname,
      showInfo: false,
      show: false
    }
  },

  getState: function(){
    return {
      userInfo: UserStore.getUserInfo()
    }
  },

  logout: function(e){
    e.preventDefault();

    UserActions.logout();
    UserStore.redirect('/admin/login')
  },

  componentWillMount: function(){
    UserStore.addChangeListener(this._onChange);
  },

  componentDidMount: function(){
    UserActions.loggedin();
  },

  openInfo: function(e){
    e.preventDefault();
    this.setState({
      show: true
    })
  },

  _onChange: function(){
    this.setState(this.getState());
    if(!UserStore.isLoggedin()){
      UserStore.redirect('/admin/login')
    }
  },

  render: function(){
    return (
      <div>
        <ul className="account">
          <li><a href="/admin/help">Help</a></li>
          {this.state.userInfo ? <li><a href="/profile" onClick={this.openInfo}>{this.state.userInfo.first_name} {this.state.userInfo.second_name}</a></li> : null}
          <li><a href="/admin/login" onClick={this.logout}>Sign Out</a></li>
        </ul>
        <div className="logo center">
          <img src="/img/logo-icon.svg" alt="logo" />
        </div>
        <ul className="nav">
          <li><a href="/admin/dashboard" className={this.state.pathname == "/admin/dashboard" ? 'active' : ''}>Kontrolpanel</a></li>
          <li><a href="/employee/list" className={this.state.pathname == "/employee/list" ? 'active' : ''}>Medarbejdere</a></li>
          {this.state.userInfo && this.state.userInfo.role === 'admin' ? <li><a href="/admin/users" className={this.state.pathname == "/admin/users" ? 'active' : ''}>Users</a></li> : null}
        </ul>

        {this.state.userInfo ?
          <Modal style="small" show={this.state.show}>
            <UserInfo user={this.state.userInfo}/>
          </Modal>
        : null}

      </div>
    )
  }

});

module.exports = NavBar;