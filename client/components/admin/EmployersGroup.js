var React = require('react');
var $ = require('jquery');
var UserActions = require('../../actions/UserActions');
var UserStore = require('../../stores/UserStore');
var Checkbox = require('../untiles/Form').Checkbox;
var FormControl = require('../untiles/Form');
var Accordion = require('../untiles/Accordion');
var PersonsList = require('./PersonsList');
var Item = require('../untiles/Accordion').Item;

var EmployersGroup = React.createClass({

  getDefaultProps: function(){
    return {
      view: [],
      onChange: null
    }
  },

  render: function(){
    var groups = this.props.view.length ? this.props.view.map(function(item){
      return (<Item title={item.group.name} group_id={item.group._id}>
                <input type="hidden" value={item.group._id} name={"_id[" + item.group._id + "]"} />
                <PersonsList group_id={item.group._id} unit_id={item.group.base_unit} onChange={this.props.onChange} persons={item.group.persons} />
            </Item>)

    }, this) : null;

    return (
      <div className="employers-groups">
        <div className="employer-group">
          <Accordion>
            {groups}
          </Accordion>
        </div>
      </div>
    );
  }

});

module.exports = EmployersGroup;