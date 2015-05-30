var React = require("react/addons");
var ModalStore = require('../../stores/ModalStore');

var Modal = React.createClass({

  getDefaultProps: function(){
    return {
      style: "normal",
      show: null
    }
  },

  getInitialState: function(){
    return {
      show: null
    }
  },

  componentWillUpdate: function(nextProps, nextState){
    this.state.show = nextProps.show;
  },

  close: function(e){
    e.preventDefault();
    e.stopPropagation();

    if(e.target.className == 'modal-dialog' || e.target.className == 'close'){
      this.setState({
        show: false
      });
    }

    this.props.onClose.call(this);
  },

  prevented: function(e){
    e.stopPropagation();
  },

  render: function(){
    var cx = React.addons.classSet;

    var classes = cx({
      modal: true,
      fade: true,
      in: this.state.show
    });

    return (
      <div className={classes + " " + this.props.style}>
        <div className="modal-dialog" onClick={this.close}>
          <div className="modal-content" onClick={this.prevented}>
            <div className="modal-header">
              <button type="button" className="close" onClick={this.close}>&times;</button>
              <h2 className="modal-title text-center">{this.props.label}</h2>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">

            </div>
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Modal;
