var React = require('react');
var EmployeesListActions = require('../actions/EmployeesListActions');
var EmployeesListStore = require('../stores/EmployeesListStore');
var EmployeesSurnameList = React.createClass({
  getInitialState: function() {
    return {
      surnamesList: [],
      isOpenSurnameList: false,
      filtering: false
    };
  },
  componentWillMount: function() {
    EmployeesListStore.addChangeListener(this._onChange)
  },
  getState: function() {
    var list = EmployeesListStore.getSurnamesList()
    return {
      surnamesList: list
    }
  },
  _onChange: function() {
    this.setState(this.getState());
  },
  handleClick: function(e) {
    this.setState({
      isOpenSurnameList: !this.state.isOpenSurnameList
    })
  },
  filtering: function(e){
    EmployeesListActions.filterEmployeesByLetter(e.target.textContent)
    this.setState({
      filtering: e.target.textContent
    })
  },
  showAll: function(e){
    EmployeesListActions.filterEmployeesByLetter();
    this.setState({
      filtering: false
    })
  },
  render: function() {
    var self = this;
    var isShow = this.state.isOpenSurnameList && this.state.surnamesList.length;
    var className = isShow ? 'open' : 'close';

    var list = isShow ? this.state.surnamesList.map(function(surname) {

      var classNameActive = self.state.filtering && self.state.filtering.toLowerCase() === surname[0].toLowerCase() ? 'surname-first-letter active' : 'surname-first-letter';
      
      return (
        <span className={classNameActive} onClick={self.filtering}>{surname}</span>
      )
    }) : <div onClick={this.handleClick}>AZ</div>;

    return (
      <div className={"employees-surname-container " + className} >
        <div className="close-button" onClick={this.handleClick}>x</div>
        {list}
        {isShow && this.state.filtering ? <div className="text-center show-all" onClick={this.showAll}>Show All</div> : null}
      </div>
    )

  }

});

module.exports = EmployeesSurnameList;