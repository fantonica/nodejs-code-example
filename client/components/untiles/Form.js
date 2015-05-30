var React = require('react');
var UserActions = require('../../actions/UserActions');
var UserStore = require('../../stores/UserStore');
var ApiUtils = require('../../utils/ApiUtils');
var Notification = require('./Notification');
var $ = require('jquery');

var Checkbox = React.createClass({
  getDefaultProps: function(){
    return {
      isChecked: false,
      name: "units",
      id: null,
      onChange: null
    }
  },
  getInitialState: function() {
    return {
      isChecked: this.props.isChecked
    };
  },
  onChange: function() {
    this.setState({isChecked: !this.state.isChecked});

    if(this.props.onChange) this.props.onChange.call(this);
  },
  render: function(){

    var id = this.props.name + '_' + this.props.value + "_" + Math.random();

    return (
      <div className="checkbox-box">
        <input type="checkbox" name={this.props.name} id={id} value={this.props.value} onChange={this.onChange} checked={this.state.isChecked}/>
        <label htmlFor={id}>{this.props.label}</label>
      </div>
      );
  }
});

var Radiobox = React.createClass({

  getDefaultProp: function(){
    return {
      items: [],
      name: "name",
      default: true
    }
  },

  getInitialState: function(){
    return {
      defaults: true
    }
  },

  componentWillUpdate: function(nextProps, nextState){
    this.state.defaults = nextProps.default != undefined ? nextProps.default : false;

    this.render();
  },

  render: function(){

    var items = this.props.items.length ? this.props.items.map(function(item){

      var id = this.props.name + '_' + item.label.toLowerCase().replace(/ +?/g, '');

      return (<div className="item">
                <input type="radio" name={this.props.name} id={id} value={item.value} defaultChecked={this.props.defaultValue == item.value ? true : null}/>
                <label htmlFor={id}>{item.label}</label>
              </div>);

    }, this) : null;

    return (
      <div className="radio-box">
        {items}
      </div>
    );
  }
});

var Form = React.createClass({

  getDefaultProps: function(){
    return {
      parser: null,
      makeData: true,
      onChange: null
    }
  },

  getInitialState: function(){
    return {
      data: null,
      action: this.props.action || '/',
      method: this.props.method || 'get',
      redirect: this.props.redirect || null,
      submit: this.props.submit,
      error: null,
      callback: this.props.callback || null
    }
  },

  componentDidUpdate: function(){
    if(this.state.error && typeof this.state.error == 'object'){
      this.fieldError();
    }
  },

  fieldError: function(){
    var errors  = this.state.error.message.errors,
        self    = this,
        form    = $(this.refs.form.getDOMNode());

    form.find('.input-alert').remove();

    $.each(errors, function(key, data){

      var field = form.find('input[name="' + key + '"]');

      field.addClass('error');

      field.after('<div class="alert alert-error input-alert in">' + data.message + '</div>')
    });
  },

  componentDidMount: function(){

  },

  componentWillMount: function(){
    UserStore.addChangeListener(this._onComplete)
  },

  _onComplete: function(){
    if(UserStore.isSuccess()){
      this.state.redirect ? UserStore.redirect(this.state.redirect) : null;
    }else{
      this.setState({
        error: UserStore.getFormData()
      });
    }
  },

  submitHandler: function(e){

    if(e) e.preventDefault();

    this.state.callback ? this.state.callback.call(this) : null;

    var data = this.props.makeData ? UserStore.makeDataArray($(this.refs.form.getDOMNode()).serializeArray()) : $(this.refs.form.getDOMNode()).serializeArray();

    data = this.props.parser ? this.props.parser.call(this, data) : data;

    UserActions.sendForm(this.state.action, this.state.method, data);

  },

  render: function(){

    if(this.props.onChange){
      this.props.children.map(function(child){
        if(child) child.props.onChange = this.props.onChange;
      }, this);
    }

    return (
      <form ref="form" autocomplete="off" onSubmit={this.submitHandler}>
        {this.props.children}
        {this.state.error ? <Notification message={this.state.error.message} type="error"/> : null}
      </form>
    )
  }

});

module.exports = Form;
module.exports.Checkbox = Checkbox;
module.exports.Radiobox = Radiobox;