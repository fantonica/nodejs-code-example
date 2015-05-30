var React = require("react/addons");
var WizardStore = require('../../stores/WizardStore');
var AppUtils = require('../../utils/ApiUtils');

var Child = React.createClass({

  getDefaultProps: function(){
    return {
      show: false,
      data: [],
      successText: null,
      errorText: null
    }
  },

  render: function(){

    var cx = React.addons.classSet;

    var classes = cx({
      show: this.props.show,
      hide: !this.props.show
    });

    return (
      <div className={classes}>
        {this.props.children}
      </div>
    )
  }
});

var Wizard = React.createClass({

  getDefaultProps: function(){
    return {
      page: 0,
      redirect: null,
      showAll: false
    }
  },

  getInitialState: function(){
    return {
      page: this.props.page,
      data: []
    }
  },

  componentWillMount: function(){
    WizardStore.addChangeListener(this._onFormResponse);
    WizardStore.addPrevPageListener(this.prevPage);
  },

  componentDidMount: function(){

  },

  _onFormResponse: function(){
    if(WizardStore.isSuccess()){

      if(this.props.children[this.state.page].props.successText){
        AppUtils.notification(this.props.children[this.state.page].props.successText, {delay: 3000, type: "success"});
      }

      if(!this.props.showAll) this.state.page == this.props.children.length - 1 ? this.props.redirect ? window.location.replace(this.props.redirect) : null : this.nextPage();
    }
  },

  nextPage: function(e){
    this.setState({
      page: this.state.page + 1 < this.props.children.length ? this.state.page + 1 : this.state.page,
      data: WizardStore.getData()
    });
  },

  prevPage: function(e){

    this.setState({
      page: this.state.page >= 0 ? this.state.page - 2 : 0
    });

  },

  render: function(){

    var classes = "wizard " + this.props.classes;

    var children = this.props.children.length ? this.props.children.map(function(child){
      var index = this.props.children.indexOf(child);

      return (<Child index={index} show={this.props.showAll ? true : index == this.state.page} data={index == this.state.page ? this.state.data : null} children={child} />)

    }, this) : null;

    return (
      <div className={classes}>
        {children}
      </div>
    );
  }

});

module.exports = Wizard;