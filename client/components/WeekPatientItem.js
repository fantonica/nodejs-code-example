var React = require("react");
var moment = require("moment");

var WeekPatientItem = React.createClass({

  getInitialState: function(){
    return {
      overlay: false
    }
  },

  checkTime: function(){
      var hour = moment().hour();
      var minute = moment().minute();


      var atMoment = moment(new Date()).valueOf();

      var shiftDay = moment().isoWeekday(moment().day() + this.props.day).startOf('day');

      var startShift = shiftDay
                          .add(this.props.shift.start_time.split('.')[0], 'hours')
                          .add(this.props.shift.start_time.split('.')[1], 'minutes')
                          .valueOf();

      var endShift = shiftDay
                      .add(this.props.shift.end_time.split('.')[0], 'hours')
                      .add(this.props.shift.end_time.split('.')[1], 'minutes')
                      .valueOf();

      this.setState({
        overlay: atMoment < startShift
      });

  },
  componentDidMount: function() {
    this.checkTime();
    this.interval = setInterval(this.checkTime, 1000 * 60);
  },
  render: function(){

    var img = this.props.user.image_url || '/img/no_photo.png';

    var label = 'shift' + this.props.color, overlay = this.state.overlay ? 'overlay in' : 'overlay';

    if(this.props.size < 150){
      label += ' shift-middle'
    }

    var name = this.props.options.show_fullname ? this.props.user.initials : this.props.user.initials.split(/\s/).map(function(w, i){
      if (!i) return w;
      return w.substring(0, 1).toUpperCase() + '.';
    }).join(' ');

    return (
      <li style={{maxWidth: this.props.size, height: this.props.size - 10}} className={this.props.color}>
        <div className="inner" style={{height: this.props.size - 10, marginBottom: 10}}>
          {this.props.options.show_photos ? <div className={overlay} style={{width: this.props.size > 115 ? 115 : this.props.size}}>
            <img src={img} alt=""/>
          </div> : null }

          <div style={{maxWidth: this.props.size > 115 ? 115 : this.props.size, position: this.props.size > 158 ? 'static' : 'absolute',  marginLeft: 'auto', marginRight: 'auto'}} className={label}>
                {this.props.shift.start_time} - {this.props.shift.end_time}
            <strong className="name">{name}
              {this.props.options.show_skills && this.props.user.skills ? <span className="skill">{this.props.user.skills}</span> : <span className="skill"></span>}
            </strong>

          </div>
        </div>
      </li>
    )
  }
});

module.exports = WeekPatientItem;