var React = require('react');
var EmployeesListActions = require('../actions/EmployeesListActions');
var EmployeesSearch = React.createClass({
  getInitialState: function() {
    return {
      formStatus: 'disable',
      searchQuery: null
    };
  },
  handleClick: function(e) {
    this.setState({
      formStatus: 'enable'
    })
    this.refs.searchField.getDOMNode().focus()
  },
  handleBlur: function(e) {
    if (!this.state.searchQuery) {
      this.setState({
        formStatus: 'disable'
      })
    }
  },
  handleChange: function(e) {
    var value = e.target.value
    EmployeesListActions.filterEmployeesList(value)
    this.setState({
      searchQuery: value.length ? value : null
    })
  },
  render: function() {
    return (
      <div className={"search-wrapper " + this.state.formStatus}>
        <input onChange={this.handleChange} onBlur={this.handleBlur} type="text" className="search-employees-field " ref="searchField" />
        <span className="fake-icon" onClick={this.handleClick}></span>
      </div>
    );
  }

});

module.exports = EmployeesSearch;