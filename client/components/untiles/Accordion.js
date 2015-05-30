var React = require("react/addons");
var WizardStore = require("../../stores/WizardStore");

var Item = React.createClass({

  getDefaultProps: function(){
    return {
      collapsed: true
    }
  },

  getInitialState: function(){
    return {
      collapsed: this.props.collapsed,
      editTitle: false,
      title: this.props.title
    }
  },

  componentDidMount: function(){
    WizardStore.addAccordionListener(this.update);
  },

  update: function(){
    if(this.isMounted()){
      this.setState({
        collapsed: true
      });
    }

  },

  toggle: function(e){
    e.preventDefault();
    e.stopPropagation();

    WizardStore.collapsed();

    this.setState({
      collapsed: !this.state.collapsed
    });

  },

  editTitle: function(e){
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      editTitle: !this.state.editTitle
    })
  },

  submitHandler: function(e){
    e.preventDefault();
  },

  changeHandler: function(e){
    this.refs.name.getDOMNode().value = e.target.value;
    this.setState({
      title: e.target.value
    })
  },

  _onPrevented: function(e){
    e.stopPropagation();
    e.preventDefault();
  },

  render: function(){

    var cx = React.addons.classSet;

    var classesPanel = cx({
      'panel-collapse' : true,
      'in': !this.state.collapsed
    });

    var classesHeader = cx({
      'panel-header' : true,
      'collapsed': this.state.collapsed
    });

    return (
      <div className="collapse-panel">
        <div className={classesHeader}>
          <h4 className="panel-title" onClick={this.toggle}>
            {this.state.editTitle ? <input type="text" onChange={this.changeHandler} onClick={this._onPrevented} onBlur={this.editTitle} defaultValue={this.props.title} /> : <a href="#" onDoubleClick={this.editTitle} onClick={this._onPrevented}>{this.state.title}</a>}
            <input ref="name" type="hidden" name={"name[" + this.props.group_id + "]"} defaultValue={this.props.title}/>
          </h4>
          <span className="arrow">
            <i className="fa fa-chevron-down"></i>
          </span>
        </div>
        <div className={classesPanel} ref="panel">
          <div className="panel-body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

var Accordion = React.createClass({

  render: function(){
    return (
      <div className="collapse-group">
        {this.props.children}
      </div>
    );
  }

});

module.exports = Accordion;
module.exports.Item = Item;