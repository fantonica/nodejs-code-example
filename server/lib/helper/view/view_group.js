var async = require('async')
  , moment = require('moment')
  , Availability = require('../../../models/availability')
  , Person = require('../../../models/person')
  , PersonViewHelper = require('./person');

var getDayGroupsView = function (view, start_time, end_time, current_time, callback) {
  var groups = [];

  if (view) {
    // sort groups by order field
    var _groups = view.groups;
    _groups.sort(function (m1, m2) { return m1.order - m2.order; });

    async.eachSeries(view.groups, function (group_info, cb) {
      group_info.group
        .populate('persons.person', function (err, view_group) {
          var shifts = [];

          async.each(view_group.persons, function (person_details, cba) {
            person_details
              .person
              .populate({
                path: '_planning_info',
                match: {
                  _section_unit: { $in: person_details.accepted_units },
                  validity_start: { $lt: start_time },
                  validity_end: { $gt: end_time }
                }
              }, function (err, person_info) {
                if (person_info && person_info._planning_info.length > 0) {
                  PersonViewHelper.getDayJsonView(person_info, start_time, end_time, person_details.accepted_units, current_time, function (user_info) {
                    if (user_info)
                      shifts.push(user_info);
                    cba();
                  });
                } else {
                  cba();
                }
              });
          }, function (err) {
            if (shifts.length > 0) {
              // sorting, by shift end time and initials afterwards
              shifts.sort(function (a, b) {
                var endTimeA = moment(a.shift[1], 'HH.mm'), endTimeB = moment(b.shift[1], 'HH.mm');
                if (endTimeA < endTimeB) 
                  return -1
                if (endTimeA > endTimeB) 
                  return 1

                var nameA = a.user.initials.toLowerCase(), nameB = b.user.initials.toLowerCase()
                if (nameA < nameB)
                  return -1 
                if (nameA > nameB)
                  return 1
              });

              groups.push({
                name: group_info.group.name,
                shifts: shifts
              })
            }

            cb();
          })
        })
    }, function (err) {
      callback(groups);
    })
  } else {
    callback(groups);
  }
  
}
exports.getDayGroupsView = getDayGroupsView;

/**
 * Getting week groups view
 * 
 * @param  {View}   view       
 * @param  {Date}   start_time 
 * @param  {Date}   end_time   
 * @param  {Function} callback
 */
var getWeekGroupsView = function (view, start_time, end_time, group_name, callback) {
  var groups = [];

  if (view) {
    // sort groups by order field
    var _groups = view.groups;

    _groups.sort(function (m1, m2) { return m1.order - m2.order; });

    async.eachSeries(_groups, function (group_info, cb) {
      group_info.group
        .populate({
          path: 'persons.person', 
          options: { sort: { "first_name": 1 }}
        }, function (err, view_group) {
          var shifts = [];

          if (view_group.persons.length > 0) {
            async.eachSeries(view_group.persons, function (person_details, cba) {
              // proceed with planning info
              person_details
                .person
                .populate({
                  path: '_planning_info',
                  match: {
                    _section_unit: { $in: person_details.accepted_units },
                    validity_start: { $lt: start_time },
                    validity_end: { $gt: end_time }
                  }
                }, function (err, person_info) {
                  if (person_info._planning_info.length > 0) {
                    PersonViewHelper.getWeekJsonView(person_info, start_time, end_time, person_details.accepted_units, function (user_info) {
                      shifts.push(user_info);
                      cba();
                    });
                  } else {
                    cba();
                  }
                });
            }, function (err) {
              // sorting - show first employees with events and by names
              shifts.sort(function (a, b) {
                if (a.week_total == 0 && b.week_total == 0) return 0;
                if (a.week_total == 0 && b.week_total > 0) return 1;
                if (a.week_total > 0 && b.week_total == 0) return -1;

                var nameA = a.user.initials.toLowerCase(), nameB = b.user.initials.toLowerCase()
                if (nameA < nameB)
                  return -1 
                if (nameA > nameB)
                  return 1
              });

                !group_name || group_name == view_group.name ? groups.push({
                  name: group_info.group.name,
                  shifts: shifts
                }) : null;

              cb();
            })
          } else {
            cb();
          }

        })
    }, function (err) {
      callback(groups);
    })
  } else {
    callback(groups);
  }
}

exports.getWeekGroupsView = getWeekGroupsView;
