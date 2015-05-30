var React = require("react");

var Notification = React.createClass({

  getInitialState: function(){
    return {
      type: this.props.type,
      show: false
    }
  },

  componentDidMount: function(){
    var self = this;

    setTimeout(function(){
      self.setState({
        show: true
      })
    }, 10)
  },

  componentWillReceiveProps: function(){
    this.setState({
      show: true
    })
  },

  close: function(){
    this.setState({
      show: false
    })
  },

  render: function(){

    var boxClass = "alert";

    if(this.state.type){
      boxClass += " alert-" + this.state.type
    }

    this.state.show ? boxClass += " in" : null;

    return (
      <div className={boxClass}>
        <div className="close" onClick={this.close}>&times;</div>
        <div className="alert-body">
          {typeof this.props.message == 'string' ? this.props.message : this.props.message.message }
        </div>
      </div>
    )
  }

});

module.exports = Notification;