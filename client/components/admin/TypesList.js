var React = require("react");
var UserActions = require("../../actions/UserActions");
var UserStore = require("../../stores/UserStore");

var TypesList = React.createClass({

  getDefaultProps: function(){
    return {
      title: "Select type",
      default: null
    }
  },

  getInitialState: function(){
    return {
      types: []
    }
  },

  componentWillMount: function(){
    UserStore.addChangeListener(this._onChange);
  },

  componentDidMount: function(){
    UserActions.fetchTypes();
  },

  _onChange: function(){
    this.setState({
      types: UserStore.getTypesList()
    })
  },

  change: function(e){
    UserStore.setValue('currentType', e.target.options[e.target.selectedIndex].value)

    this.props.onChange.call(this, e.target.options[e.target.selectedIndex].value)
  },

  render: function(){

    var types = Object.keys(this.state.types).length ? Object.keys(this.state.types).map(function(type){

      return (<option value={type} selected={type == this.props.default ? "selected" : null}>{this.state.types[type]}</option>);

    }, this) : null;

    return (

      <div className="form-group">
        <label>{this.props.title}</label>
        <div className="select-box">
          <select name="type" className="form-control" onChange={this.change}>
          {types}
          </select>
        </div>
      </div>
    );
  }
});

module.exports = TypesList;