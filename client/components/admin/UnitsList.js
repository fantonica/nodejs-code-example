var React = require('react');
var UserActions = require("../../actions/UserActions");
var UserStore = require("../../stores/UserStore");

function isAllChecked(list){
  var checked = [];
  checked = list.filter(function(item){
    return item.props.isChecked
  });

  return checked.length === list.length
}

function isNotAllChecked(list){
  var checked = [];
  checked = list.filter(function(item){
    return item.props.isChecked
  });

  return checked.length === list.length - 1
}

var Checkbox = React.createClass({
  getDefaultProps: function(){
    return {
      isChecked: false,
      onChange: null,
      callback: null
    }
  },

  getInitialState: function() {
    return {
      isChecked: this.props.isChecked
    };
  },

  onChange: function() {
    this.props.isChecked = !this.props.isChecked;

    this.setState({
      isChecked: !this.props.isChecked
    });

    if(this.props.onChange) this.props.onChange.call(this);
    if(this.props.callback) this.props.callback.call(this, {
      id: this.props.value,
      status: this.props.isChecked
    });
  },
  render: function(){
    return (
      <div className="checkbox-box">
        <input type="checkbox" name={this.props.name} id={this.props.id} value={this.props.value} onChange={this.onChange} checked={this.props.isChecked}/>
        <label htmlFor={this.props.id}>{this.props.label}</label>
      </div>
    );
  }
});

var UnitList = React.createClass({

  getDefaultProps: function(){
    return {
      units: false,
      name: 'units',
      onChange: null
    }
  },

  getInitialState: function(){
    return {
      existUnits: false,
      units: [],
      selectAll: false,
      label: "Choose all"
    }
  },

  componentDidMount: function(){
    UserActions.fetchAllUnits();
  },

  componentWillMount: function(){
    UserStore.addChangeListener(this._onChange);
  },

  _onChange: function(e){
    this.setState({
      units: UserStore.getUnits(),
      existUnits: this.props.unitsChecked.accepted || []
    });
  },

  onSelectAll: function(e) {
    e.preventDefault();

    if(!this.state.selectAll){
      this.state.units.map(function(item){
        if(this.state.existUnits.indexOf(item._id) === -1) this.state.existUnits.push(item._id);
      }, this);
    }else{
      this.state.existUnits = []
    }

    this.setState({
      selectAll: !this.state.selectAll,
      label: !this.state.selectAll ? "Remove all" : "Choose all"
    });
  },

  _beforeChecked: function(){

  },

  _onChecked: function(e){

    this.setState({
      selectAll: isAllChecked(this.list)
    });

    if(e.status) {
      this.state.existUnits.push(e.id)
    }else{
      this.state.existUnits.splice(this.state.existUnits.indexOf(e.id), 1)
    }
  },

  render: function(){
    this.list = typeof this.state.existUnits == 'object' && this.state.units.length ? this.state.units.map(function(item){

      var checked = this.state.existUnits.indexOf(item._id) >= 0 ? true : false;

      return (<Checkbox name={this.props.name} value={item._id} label={item.text} id={item.id} onChange={this.props.onChange} callback={this._onChecked} isChecked={checked}/>)

    }, this) : <div>Units loading...</div>;

    return (
      <div className="units-list">
        <h4>Units
          <div className="pull-right">
            <button className="btn" onClick={this.onSelectAll}>{this.state.selectAll ? "Remove all" : "Choose all"}</button>
          </div>
        </h4>
        {this.list}
      </div>
      );
  }

});

module.exports = UnitList;