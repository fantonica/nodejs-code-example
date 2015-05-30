var React = require("react");
var UserActions = require("../../actions/UserActions");
var UserStore = require("../../stores/UserStore");
var Checkbox = require('../untiles/Form').Checkbox;

var PersonsList = React.createClass({

  getInitialState: function(){
    return {
      persons : [],
      onChange: null
    }
  },

  componentWillMount: function(){
    UserStore.addChangeListener(this._onComplete);
  },

  componentDidMount: function(){
    UserActions.fetchPersonsById(this.props.unit_id)
  },

  _onComplete: function(){
    this.setState({
      persons: UserStore.getUnitsByGroup(this.props.unit_id)
    });

    this.state.persons.length ? UserStore.removeChangeListener(this._onComplete) : null;
  },

  render: function(){

    var persons = UserStore.pick(this.props.persons, 'person')

    var list = this.state.persons.length ? this.state.persons.map(function(person){
      return (<Checkbox label={person.first_name + " " + person.second_name} id={person.id} name={"persons[" + this.props.group_id + "]"} onChange={this.props.onChange} value={person._id} isChecked={persons.indexOf(person._id) >= 0 ? true : false} />)
    }, this) : null;

    return (
      <div className="person-list">
        {list}
      </div>
    );
  }

});

module.exports = PersonsList;
