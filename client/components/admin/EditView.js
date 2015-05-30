var React = require("react");
var FormControl = require("../untiles/Form");
var UserActions = require("../../actions/UserActions");
var Radiobox = require("../untiles/Form").Radiobox;
var UnitsList = require("./UnitsList");
var EmployersGroup = require("./EmployersGroup");
var Wizard = require("../untiles/Wizard");
var WizardStore = require("../../stores/WizardStore");
var TypesList = require("../admin/TypesList");
var $ = require('jquery');
var type = null;
var _options = {
  show_fullname: null
};

function makeData(data, id){

  var regexp = new RegExp('\\[(.*?)\\]');
  var keys = [];

  var results = {
    id: id,
    groups: []
  };

  data.map(function(item){
    var val = regexp.exec(item['name'])[1]
    keys.indexOf(val) == -1 ? keys.push(val) : null;
  });

  keys.map(function(key){

    var obj = {
      _id: key,
      persons: pick(data, 'persons[' + key + ']'),
      name: pick(data, 'name[' + key + ']', 'string')
    };

    results.groups.push(obj)
  });

  return results;
}

function pick(data, key, type){

  var results = [];

  data.map(function(item){
    item['name'] === key ? results.push(item['value']) : null;
  });

  if(type == 'string'){
    results = results[0];
  }

  return results;

}

function pickGroup(data){

  var results = [];

  data.map(function(item){
    results.push(item.group.base_unit);
  });

  return results;
}

function queryId(){
  var match = window.location.search.match(/(\?|&)id\=([^&]*)/);
  return match != null ? decodeURIComponent(match[2]) : null;
}

var CommonForm = React.createClass({

  getInitialState: function(){
    return {
      name: null,
      type: null,
      _id: null
    }
  },

  componentWillMount: function(){
    WizardStore.addViewListener(this._onChange);
  },

  componentDidMount: function(){
    UserActions.fetchView(queryId());
  },

  _onChange: function(){
    this.setState(WizardStore.getView());

    type = this.state.type;
    _options = this.state._options;

  },

  _onChangeType: function(e){
    type = e;
    WizardStore.emitEvent('change.next.page');

    this.refs.form.submitHandler();
  },

  _onFormChange: function(){
    var _this = this;

    clearTimeout(this.timeout);

    this.timeout = setTimeout(function(){
      _this.refs.form.submitHandler()
    }, 500)
  },

  changeHandler: function(e){
    this.setState({
      name: e.target.value
    });

  },

  render: function(){

    return (
      <FormControl ref="form" action="/api/admin/view/save/name" method="post">
        <div className="form-group">
          <label>Edit name</label>
          <input name="name" className="form-control" onChange={this.changeHandler} value={this.state.name} />
        </div>

        <TypesList title="Edit type" onChange={this._onChangeType} default={this.state.type}/>

        <input type="hidden" name="id" value={this.state._id} />
      </FormControl>
    );
  }
});

var SelectUnit = React.createClass({

  getInitialState: function(){
    return {
      _id: null,
      groups: []
    }
  },

  parser: function(data){
    var res = [];

    if(typeof data.groups == 'string' ){
      res.push(data.groups);
      data.groups = res;
    }

    return data;
  },

  componentWillMount: function(){
    WizardStore.addViewListener(this._onChange);
  },

  componentDidMount: function(){
    this.timer = setTimeout((function(_this){
      return function(){
        _this.refs.form.submitHandler();
      };
    })(this), 1000)
  },

  _onChange: function(){
    this.setState(WizardStore.getView());
  },

  _onFormChange: function(){
    this.refs.form.submitHandler()
  },

  render: function(){

    var groups = {
      accepted: []
    };

    groups.accepted = this.state.groups.length ? pickGroup(this.state.groups) : [];

    return (
      <FormControl ref="form" action="/api/admin/view/save/groups" onChange={this._onFormChange} method="post" parser={this.parser}>

        <h2>Edit units</h2>

        {groups.accepted.length ? <UnitsList name="groups" unitsChecked={groups} /> : null}

        {this.state._id ? <input name="id" value={this.state._id} type="hidden" /> : null}

      </FormControl>
    );
  }
});

var EmployersList = React.createClass({

  getInitialState: function(){
    return {
      view: []
    }
  },

  parser: function(data){

    data = makeData(data, queryId());
    console.log(data)
    return data;
  },

  componentWillMount: function(){
    WizardStore.addNextPageListener(this._onChange);
    WizardStore.addViewListener(this._onChange);
    UserActions.fetchView(queryId());
  },

  componentDidMount: function(){

  },

  _onFormChange: function(){
    this.refs.form.submitHandler()
  },

  _onChange: function(){
    this.setState(WizardStore.getData());
  },

  back: function(){
    WizardStore.prevPage();
  },

  render: function(){
    return (
      <FormControl ref="form" action="/api/admin/view/save/persons" onChange={this._onFormChange} method="post" makeData={false} parser={this.parser}>
        <h2>Edit employers list</h2>

        <EmployersGroup id={this.state.id} view={this.state.view} />

      </FormControl>
    );
  }
});

var ViewSettings = React.createClass({

  getInitialState: function(){
    return {
      id: null,
      _options: {}
    }
  },

  parser: function(data){
    return {
      id: queryId(),
      options: {
        show_photos: data['show_photos'] === 'true' ? true : false,
        show_fullname: data['show_fullname'] === 'true' ? true : false,
        show_skills: data['show_skills'] === 'true' ? true : false,
        days_ahead: data['days_ahead']
      }
    }
  },

  componentWillMount: function(){
    WizardStore.addNextPageListener(this._onChange);
  },

  _onChange: function(){
    this.setState(WizardStore.getData());
    this.setState({
      _options: _options
    })
  },

  back: function(){
    WizardStore.prevPage();
  },

  _onFormChange: function(){
    this.refs.form.submitHandler()
  },

  render: function(){

    var days = [];

    for(var i = 0; i < 7; i++){

      var label = i + " Days ahead";

      if(i == 0){
        label = "Only Current"
      }
      if(i == 1){
        label = "1 Day ahead"
      }

      days.push(<option value={i + 1}>{label}</option>);
    }
    return (
      <FormControl ref="form" action="/api/admin/view/save/options" onChange={this._onFormChange} method="post" parser={this.parser}>

        <h2>Edit View Settings</h2>

        {this.state.id ? <input name="id" value={this.state.id} type="hidden" /> : null}

        <h4 className="text-center">Employee navs to appear as</h4>

        {type == 'patient_week' || type == 'patient_day' || type == 'employee_week' ? <div><Radiobox name="show_fullname" defaultValue={_options.show_fullname} items={[{label: "Full name", value: true}, {label: "Initials", value: false}]}/><div className="example"><div>Anders Anderson</div><div>Anders A.</div></div></div> : null}


        {type == 'patient_week' || type == 'patient_day' ? <div><h4 className="text-center">Employee photo is displayed</h4>
        <Radiobox name="show_photos" defaultValue={_options.show_photos} items={[{label: "Yes", value: true}, {label: "No", value: false}]}/></div> : null}

        {type == 'patient_week' ? <div><h4 className="text-center">How many days to show?</h4><div className="select-box"><select className="form-control" name="days_ahead" defaultValue={_options.days_ahead}>{days}</select></div></div> : null}

        {type == 'patient_week' || type == 'patient_day' ? <div><h4 className="text-center">Show skills?</h4><Radiobox name="show_skills" defaultValue={_options.show_skills} items={[{label: "Yes", value: true}, {label: "No", value: false}]}/></div> : null}

      </FormControl>
    );
  }
});

var EditView = React.createClass({

  render: function(){
    return (
      <Wizard classes="col6 center" showAll={true} redirect="/admin/dashboard">
        <CommonForm successText="View updated" />
        <SelectUnit successText="View updated" />
        <EmployersList successText="View updated" />
        <ViewSettings successText="View updated" />

        <div className="text-center">
          <a href="/admin/dashboard" className="btn btn-primary">Back to list</a>
        </div>
      </Wizard>
    )
  }
});

module.exports = EditView;
