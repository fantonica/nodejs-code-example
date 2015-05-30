var React = require('react');
var moment = require('moment');
var EmployeeActions = require('../actions/EmployeeActions');
var EmployeeStore = require('../stores/EmployeeStore');
var UserActions = require('../actions/UserActions');
var UserStore = require('../stores/UserStore');

var WeekHeading = React.createClass({

    getInitialState: function() {
        return {
            week: moment().isoWeek(),
            fixed: window.scrollY != 0,
            showButton: false
        };
    },

    getState: function() {
        return {
            week: parseInt(EmployeeStore.getWeek())
        };
    },

    componentWillMount: function() {
        EmployeeStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        UserActions.loggedin();
        var self = this;
        setTimeout(function() {
          EmployeeActions.fetchWeek(self.state.week);
          window.onscroll = function () {
            if (!self.state.fixed && window.scrollY > 0) self.setState({fixed: true});
            if (self.state.fixed && window.scrollY == 0) self.setState({fixed: false});
          }.bind(self);
        }, 1000);
    },

    componentDidUpdate: function(prevProps, prevState) {
        if (prevState.week != this.state.week) EmployeeActions.fetchWeek(this.state.week);
    },

    componentWillUnmount: function() {
        EmployeeStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        //this.setState(this.getState());
        //if(UserStore.isLoggedin()){
        //
        //}else{
        //  UserStore.redirect('/admin/login')
        //}
    },

    searchHandler: function(e){
      EmployeeActions.filterEmployeesList(e.target.value);

      this.setState({
        showButton: e.target.value != '' ? true : false
      });
    },

    prev: function(e) {
        e.preventDefault();
        this.setState({ week: (this.state.week - 1)})
      console.log(this.state.week)
    },

    next: function(e) {
        e.preventDefault();
        this.setState({ week: (this.state.week + 1)})

    },

    _weekChange: function(e){
      console.log(e.target.value)
      this.setState({ week: e.target.value})
    },

    today: function(e) {
        e.preventDefault();
        this.setState({ week: parseInt(moment().format('w')) });
    },

    clearForm: function(e){
      this.refs.search.getDOMNode().value = ''
      EmployeeActions.filterEmployeesList('');
    },

    render: function() {
        var date = moment();
        var week = moment().isoWeek(this.state.week).startOf('isoweek');

        var weekList = [];

        var start = moment().startOf('year');

        for(var i = -9*4; i < 12*4; i++){

          var w = moment().add(i, 'weeks');
          console.log(w.diff(start, 'week') + 2, w.format('w, YYYY'));

          var option = (<option value={w.diff(start, 'week') + 2}>Uge {w.format('w, YYYY')}</option>);
          weekList.push(option)

        }

        return (
            <div className={"fixed-top" + (this.state.fixed ? ' fixed' : '')}>
                <div className="row week-navigation">
                    <div className="col16">
                        <h2>
                            <a href="#" onClick={this.today} className={'today' + (date.isoWeek() == week.isoWeek() ? ' hidden' : '')}>I dag</a>
                            <a href="#" onClick={this.prev} className="arrow arrow-left">&lt;</a>
                            <span>Uge {week.format('w, YYYY')}<select onChange={this._weekChange} defaultValue={this.state.week}>{weekList}</select></span>
                            <a href="#" onClick={this.next} className="arrow arrow-right">&gt;</a>
                        </h2>
                    </div>
                </div>
                <div className="row week-heading">
                    <div className="name-column">
                      <input name="search" type="text" placeholder="Search" className="form-control" ref="search" onChange={this.searchHandler}/>
                      {this.state.showButton ? <span className="clear-form" onClick={this.clearForm}>&times;</span> : null}
                    </div>
                    <div className="week-column">
                        <div className={'col2' + (week.format('D/M') == date.format('D/M') ? ' active' : '')}>Mandag {week.format('D/M')}</div>
                        <div className={'col2' + (week.add(1, 'days').format('D/M') == date.format('D/M') ? ' active' : '')}>Tirsdag {week.format('D/M')}</div>
                        <div className={'col2' + (week.add(1, 'days').format('D/M') == date.format('D/M') ? ' active' : '')}>Onsdag {week.format('D/M')}</div>
                        <div className={'col2' + (week.add(1, 'days').format('D/M') == date.format('D/M') ? ' active' : '')}>Torsdag {week.format('D/M')}</div>
                        <div className={'col2' + (week.add(1, 'days').format('D/M') == date.format('D/M') ? ' active' : '')}>Fredag {week.format('D/M')}</div>
                        <div className={'col2 weekend-left' + (week.add(1, 'days').format('D/M') == date.format('D/M') ? ' active' : '')}>Lørdag {week.format('D/M')}</div>
                        <div className={'col2 weekend-right' + (week.add(1, 'days').format('D/M') == date.format('D/M') ? ' active' : '')}>Søndag {week.format('D/M')}</div>
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = WeekHeading;