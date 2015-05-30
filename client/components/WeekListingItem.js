/**
 * @jsx React.DOM
 */

var React = require('react');

var WeekListingItem = React.createClass({

    getInitialState: function() {
        return {
            open: false
        };
    },

    toggle: function(e) {
        this.setState({ open: !this.state.open });
    },


    render: function() {
        var hours = this.props.data.week_total;
        var initials = this.props.data.user.initials.split(/\s/).map(function(w){
            return w.substring(0, 1).toUpperCase();
        }).join('');
        var shortname = this.props.data.user.initials.split(/\s/).map(function(w, i){
            if (!i) return w;
            return w.substring(0, 1).toUpperCase() + '.';
        }).join(' ');

        // Here be dragons
        
        var offset = 0;
        var spread = 0;
        var spreadc = 0;
        var columns = 0;
        var days = this.props.data.days.map(function(day, idx){
            var classname, shifts = day.map(function(range, idx){
                var color;
                var meta = range.absence ? <div className="absence-text">{range.absence.text}</div> : null;

                if (range.work_type == 'overtime') {
                    color = 'overtime';
                } else if (range.absence) {
                    color = 'absent';
                } else {
                    color = 'day';
                    if (parseFloat(range.start_time) < 6) color = 'night';
                    if (parseFloat(range.start_time) >= 12) color = 'evening';
                    if (parseFloat(range.start_time) >= 21) color = 'night';
                }

                return <div key={idx} className={"shift shift-"+color}>{meta}{range.start_time} - {range.end_time.replace(/^[a-z]{3} /, '')}</div>
            });

            if (!shifts.length) {
                offset++;
                return null;
            }

            classname = 'col2';

            if (offset) {
                classname += ' offset' + (offset * 2);
                columns += offset;
                offset = 0;
            }

            columns++;
            return <div key={idx} className={classname}>{shifts}</div>;

        }).filter(function(day){
            return day !== null;
        });

        return (
            <li className="row">
                <div className="name-column">
                    <span className="name">{shortname}</span>
                </div>
                <div className="week-column">
                    {days}
                    <div className={"col2 overlay-2" + (columns < 7 ? ' offset' + ((7 - columns) * 2) : '')}>
                        <span className="hours" onClick={this.toggle}>i</span>
                        <div className={"info" + (this.state.open ? ' open' : '')}>
                            <a className="close" onClick={this.toggle}>x</a>
                            <div className="row">
                                <div className="col16">
                                    <h4>Informationer om {shortname}</h4>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col4 offset4">
                                    <span className="data">
                                        <strong>{this.props.data.user.planning.norm_time}</strong>
                                        Lønbrøk
                                    </span>
                                </div>
                                <div className="col8">
                                    <span className="data">
                                        <strong>{this.props.data.user.planning.title}</strong>
                                        Stillingsbetegnelse
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    }

});

module.exports = WeekListingItem;