/**
 * @jsx React.DOM
 */

var React = require('react');
var DayListingItem = require('./DayListingItem');

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


var DayListingGroup = React.createClass({

    render: function() {
        var order = [];
        var columns = [];
        for(i in this.props.order){
          order.push(this.props.order[i]);
        }

        order.forEach(function(timespan, idx){
            var width;

            switch(timespan) {
                case 'dag': width = this.props.dagwidth; break;
                case 'aften': width = this.props.aftenwidth; break;
                case 'nat': width = this.props.natwidth; break;
            }

            var users = [];

            this.props.data[timespan] ?
                this.props.data[timespan].map(function(item){

                  users.push({
                    first_name: item.user.first_name,
                    second_name: item.user.second_name,
                    initials: item.user.initials,
                    skills: item.user.skills || null,
                    image_url: item.user.image_url || null,
                    shift_start: item.shift[0],
                    shift_end: item.shift[1],
                    timespan: timespan,
                    day: this.props.day,
                    order: idx
                  });

                }, this) : [];

            users.sort(sort_by({
              name: 'shift_start',
              reverse: false
            }, {
              name: 'initials',
              reverse: false
            }, {
              name: 'skills',
              reverse: false
            }));

            var content = users.length ? users.map(function(item){

              return <DayListingItem options={this.props.options} data={item} width={this.props.itemwidth} maxWidth={this.props.itemheight} height={this.props.itemheight} />;

            }, this) : [];

            columns.push(
                <ul key={idx} className={'daycolumn table-cell column-'+timespan} style={{minHeight: this.props.itemheight + 'px'}}>
                    {content}
                </ul>
            );
        }, this);

        var groupLink = "/patient/week" + location.search + "&group=" + this.props.name;

        return (
            <li className="daycolumns table-row">
                <div className="groupname table-cell">
                  <a href={groupLink}>{this.props.name}</a>
                </div>
                {columns}
            </li>
        );
    }

});

module.exports = DayListingGroup;