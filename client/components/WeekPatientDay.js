var React = require("react");
var WeekPatientItem = require('./WeekPatientItem');
var PatientStore = require('../stores/PatientStore');


function default_cmp(a, b) {
    if (a == b) return 0;
    return a < b ? -1 : 1;
  }

function getCmpFunc(primer, reverse) {
    var cmp = default_cmp;
    if (primer) {
      cmp = function(a, b) {
        return default_cmp(primer(a), primer(b));
      };
    }
    if (reverse) {
      return function(a, b) {
        return -1 * cmp(a, b);
      };
    }
    return cmp;
}

// actual implementation
function sort_by() {
  var fields = [],
    n_fields = arguments.length,
    field, name, reverse, cmp;

  // preprocess sorting options
  for (var i = 0; i < n_fields; i++) {
    field = arguments[i];
    if (typeof field === 'string') {
      name = field;
      cmp = default_cmp;
    }
    else {
      name = field.name;
      cmp = getCmpFunc(field.primer, field.reverse);
    }
    fields.push({
      name: name,
      cmp: cmp
    });
  }

  return function(A, B) {
    var a, b, name, cmp, result;
    for (var i = 0, l = n_fields; i < l; i++) {
      result = 0;
      field = fields[i];
      name = field.name;
      cmp = field.cmp;

      result = cmp(A[name], B[name]);
      if (result !== 0) break;
    }
    return result;
  }
}

function sortShifts(shifts, day){

  var users = [];

  shifts = shifts ? shifts.filter(function(item){
    return item.days[day][0] && !item.days[day][0].absence
  }) : null;

  var shiftsByTime = [], shiftsByName = [];

  shifts.map(function(shift){

    var user = {
      first_name: shift.user.first_name,
      second_name: shift.user.second_name,
      image_url: shift.user.image_url || null,
      skills: shift.user.skills || null,
      initials: shift.user.initials,
      start_time: shift.days[day][0].start_time,
      end_time: shift.days[day][0].end_time,
      absence: shift.days[day][0].absence || null
    };

    users.push(user)
  });

  users.sort(sort_by({
    name: 'start_time',
    primer: parseFloat,
    reverse: false
  }, {
    name: 'initials',
    reverse: true
  }, {
    name: 'skills',
    reverse: true
  }));

  return users;
}

var WeekPatientDay = React.createClass({

  render: function(){

    var self = this;

    var shifts = sortShifts(PatientStore.getWeekShifts(), this.props.day);

    var content = shifts ? shifts.map(function(item){
      var shift = {
        start_time: item.start_time,
        end_time: item.end_time
      };

      var labelColor = "";

      if(!item.absence){

        if(parseFloat(item.start_time) > 6.00){
          labelColor = ' shift-day';
        }
        if(parseFloat(item.start_time) > 12.00){
          labelColor = ' shift-evening';
        }
        if(parseFloat(item.start_time) > 21.00 || parseFloat(item.start_time) < 6.00){
          labelColor = ' shift-night';
        }

        return <WeekPatientItem week={this.props.week} day={this.props.day} options={self.props.options} shift={shift} user={item} color={labelColor} size={self.props.itemheight}/>
      }
    }, this) : null;

    return (
      <li className="daycolumns" style={{maxHeight: this.props.itemheight}}>
        <div className={"groupname" + (this.props.day == 0 ? " first" : "")}><span>{this.props.name}</span></div>
        <ul className="daycolumn" style={{maxWidth: this.props.daycolumnwidth, maxHeight: this.props.itemheight }}>
          {content}
        </ul>
      </li>
    )
  }
});

module.exports = WeekPatientDay;