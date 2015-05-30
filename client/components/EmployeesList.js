var React = require('react');

var EmployeesListActions = require('../actions/EmployeesListActions');
var EmployeesListStore = require('../stores/EmployeesListStore');
var EmployeesListItem = require('./EmployeesListItem')
var EmployeesSearch = React.createClass({
  getInitialState: function() {
    return {
      employees: []
    }
  },
  getState: function() {
    return {
      employees: EmployeesListStore.getAlpabeticalList()
    }
  },
  _onChange: function() {
    this.setState(this.getState());
  },
  componentDidMount: function() {
    EmployeesListStore.addChangeListener(this._onChange)
    EmployeesListActions.fetchEmployeesList()
  },
  render: function() {
    var list = this.state.employees.length ? this.state.employees.map(function(emp) {
      if(emp.employees){
        var employess = emp.employees.map(function(person) {
          return (
            <EmployeesListItem name={person.first_name} skills={person.skills} initials={person.initials} id={person._id} surname={person.second_name} photoUrl={person.image_url} />
          )
        })
        return (
          <div clasName="element-wrapper">
            <div className="surname-letter">
              <div className="first-letter">{emp.letter}</div>
            </div>
            <div className="users">{employess}</div>
          </div>
        )
      }
    }) : <div className="loading">Loading...</div>
    return (
      <div className="table">
      {list}
      </div>
    );
  }

});

module.exports = EmployeesSearch;