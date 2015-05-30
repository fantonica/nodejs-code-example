var React = require("react");
var FormControl = require("../untiles/Form");
var Radiobox = require("../untiles/Form").Radiobox;
var UnitsList = require("./UnitsList");
var EmployersGroup = require("./EmployersGroup");
var Wizard = require("../untiles/Wizard");
var WizardStore = require("../../stores/WizardStore");
var TypesList = require("../admin/TypesList");
var ZeroClipboard = require("zeroclipboard");
var UserStore = require("../../stores/UserStore");
var AppUtils = require("../../utils/ApiUtils");
var type = "employee_week";
ZeroClipboard.config({swfPath: "/../ZeroClipboard.swf"});

function makeData(data, id){

    /* Convert array to sorting object */
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


    /* Pick up need values */
  var results = [];

  data.map(function(item){
    item['name'] === key ? results.push(item['value']) : null;
  });

  if(type == 'string'){
    results = results[0];
  }

  return results;

}

var CommonForm = React.createClass({

    /* Create first page with simple form */
  render: function(){
    return (
      <FormControl action="/api/admin/view/save/name" method="post">
        <h2>Create new view</h2>
        <div className="form-group">
          <label>Name of new view</label>
          <input name="name" className="form-control" />
        </div>

        <TypesList />

        <div className="text-center">
          <button type="submit" className="btn btn-primary">Create view</button>
        </div>
      </FormControl>
    );
  }

});

var SelectUnit = React.createClass({

    /* Create second page with selected need units */
  getInitialState: function(){
    return {
      id: null
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
    WizardStore.addNextPageListener(this._onChange);
  },

  _onChange: function(){
    this.setState(WizardStore.getData());
  },

  render: function(){
    return (
      <FormControl action="/api/admin/view/save/groups" method="post" parser={this.parser}>

        <h2>Select need units</h2>

        <UnitsList name="groups" unitsChecked="create" />

        {this.state.id ? <input name="id" value={this.state.id} type="hidden" /> : null}

        <div className="text-center">
          <button type="submit" className="btn btn-primary">Next</button>
        </div>

      </FormControl>
    );
  }
});

var EmployersList = React.createClass({

    /* Select employees by unit */
  getInitialState: function(){
    return {
      view: []
    }
  },

  parser: function(data){
    data = makeData(data, this.state.id);
    return data;
  },

  componentWillMount: function(){
    WizardStore.addNextPageListener(this._onChange);
  },

  _onChange: function(){
    this.setState(WizardStore.getData());
  },

  back: function(){
    WizardStore.prevPage();
  },

  render: function(){
    return (
      <FormControl action="/api/admin/view/save/persons" method="post" makeData={false} parser={this.parser}>
        <h2>Select employers</h2>

        <EmployersGroup id={this.state.id} view={this.state.view} />

        <div className="text-center">
          <button className="btn" onClick={this.back}>Back</button>
          <button type="submit" className="btn btn-primary">Next</button>
        </div>

      </FormControl>
    );
  }
});

var ViewSettings = React.createClass({

    /* View settings */
  getInitialState: function(){
    return {
      id: null
    }
  },

  parser: function(data){
    return {
      id: data['id'],
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
  },

  back: function(){
    WizardStore.prevPage();
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

    type = UserStore.getValue('currentType');

    return (
      <FormControl action="/api/admin/view/save/options" method="post" parser={this.parser}>

        <h2>View Settings</h2>

        {this.state.id ? <input name="id" value={this.state.id} type="hidden" /> : null}

        <h4 className="text-center">Employee navs to appear as</h4>

        <Radiobox name="show_fullname" defaultValue={true} items={[{label: "Full name", value: true}, {label: "Initials", value: false}]}/>

        <div className="example"><div>Anders Anderson</div><div>Anders A.</div></div>

        {type == 'patient_week' || type == 'patient_day' ? <div><h4 className="text-center">Employee photo is displayed</h4>
          <Radiobox name="show_photos" defaultValue={true} items={[{label: "Yes", checked: true, value: true}, {label: "No", value: false}]}/></div> : null}

        {type == 'patient_week' ? <div><h4 className="text-center">How many days to show?</h4><div className="select-box"><select className="form-control" name="days_ahead">{days}</select></div></div> : null}

        {type == 'patient_week' || type == 'patient_day' ? <div><h4 className="text-center">Show skills?</h4><Radiobox name="show_skills" defaultValue={true} items={[{label: "Yes", checked: true, value: true}, {label: "No", value: false}]}/></div> : null}

        <div className="text-center">
          <button className="btn" onClick={this.back}>Back</button>
          <button type="submit" className="btn btn-primary">Save &amp; Create</button>
        </div>

      </FormControl>
    );
  }
});

var GetLink = React.createClass({

  getInitialState: function(){
    return {
      url: null
    }
  },

  componentWillMount: function(){

    WizardStore.addNextPageListener(this._onChange);
  },

  componentDidUpdate: function(){
    this.client = new ZeroClipboard(this.refs.copy.getDOMNode());
    var url = this.refs.url.getDOMNode().value;
    this.client.on('copy', function(e){
      e.clipboardData.setData("text/plain", url);
    });
  },

  componentWillUnmount: function(){
    this.client.destroy();
  },

  _onChange: function(){
    this.setState(WizardStore.getData());
  },

  render: function() {
    return (
      <div>
        <h2>The view is created</h2>
        <h4 className="text-center">Copy this private URL to share</h4>

        <div className="form-group inline">
          <div className="form-item">
            <input className="form-control" ref="url" name="url" value={this.state.url} />
          </div>
          <div className="form-item">
            <button className="btn btn-primary" ref="copy">Copy</button>
          </div>
        </div>
      </div>
    )
  }
});

var CreateView = React.createClass({

  /* Initialize Wizard */
  render: function(){
    return (
        <Wizard classes="col6 center" redirect="/admin/dashboard">
          <CommonForm successText="View created"/>
          <SelectUnit successText="View updated"/>
          <EmployersList successText="View updated"/>
          <ViewSettings successText="View updated"/>
        </Wizard>
      )
  }
});

module.exports = CreateView;
