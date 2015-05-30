var async = require('async')
  , moment = require('moment')
  , Availability = require('../../../models/availability')
  , Person = require('../../../models/person');

/**
 * Getting formatted week Json view for person
 * 
 * @param  {Person}   person     [description]
 * @param  {Date}   start_time [description]
 * @param  {Date}   end_time   [description]
 * @param  {Function} callback   [description]
 * @return {void}              [description]
 */
exports.getWeekJsonView = function (person, start_time, end_time, accepted_units, callback) {
  getPersonWeekSchedule(person, start_time, end_time, accepted_units, function (err, days, week_total) {
    callback({
      user: {
        initials: person.initials,
        first_name: person.first_name,
        second_name: person.second_name,
        planning: {
          norm_time: person._planning_info[0].norm_time,
          title: (person.skills) ? person.skills : person._planning_info[0].title
        },
        image_url: person.image_url,
        skills: person.skills
      },
      days: days,
      week_total: week_total
    })
  })
}


var getDayJsonView = function (person, start_time, end_time, accepted_units, current_time, callback) {
  getPersonDaySchedule(person, start_time, end_time, accepted_units, current_time, function (shift) {
    if (shift.length > 0) {
      var info = {
        user: {
          initials: person.initials,
          first_name: person.first_name,
          second_name: person.second_name,
          skills: person.skills
        },
        shift: shift
      }

      if (person.image_url) {
        info.user.image_url = person.image_url;
      }

      callback(info);
    } else {
      callback(null);
    }
  })
  
}
exports.getDayJsonView = getDayJsonView;


var getPersonDaySchedule = function (person, start_time, end_time, accepted_units, current_time, callback) {
  var clause = [
    {$and: [
      { start_time: { $gte: start_time } },
      { start_time: { $lt: end_time } }
    ]}
  ];
  // if shifts in current range shifts
  if (current_time >= start_time && current_time < end_time) {
    clause.push(
      {$and: [
        { end_time: { $gt: start_time } },
        { end_time: { $lte: end_time } }
      ]}
    );
  }

  person
    .populate({
      path: '_availabilities',
      match: {
        $or: clause,
        kind: 'available',
        _work_unit: { $in: accepted_units }
      },
      options: { sort: { start_time: 1 }}
    }, function (err, oPerson) {
      if (oPerson && typeof oPerson._availabilities != 'undefined' && oPerson._availabilities.length > 0 && current_time < moment(oPerson._availabilities[0].end_time).valueOf()) {  
        callback([
          moment(oPerson._availabilities[0].start_time).valueOf(),
          moment(oPerson._availabilities[0].end_time).valueOf()
        ]);
      } else {
        callback([]);
      }
    })
};

/**
 * Getting employee week schedule
 *
 * @param  {Person} person
 * @param  {Date}   start_time 
 * @param  {Date}   end_time   
 * @param  {Function} callback 
 * @return {void}             
 */
var getPersonWeekSchedule = function (person, start_time, end_time, accepted_units, callback) {  
  person
    .populate({
      path: '_availabilities',
      match: {
        $and: [
          {$or: [{
            $and: [
              { start_time: { $gt: start_time } },
              { start_time: { $lt: end_time } }
            ]},
            {
            $and: [                                               //  request for long absence availabilities 
              { kind: "notAvailable" },
              { start_time: { $lt: start_time } },
              { end_time: { $gt: moment(start_time).hours(8) } }  // set to 8 hours to fetch availabilities that not belongs to night shift prev week
            ]}
          ]},
          { '_contributions.type': Availability.contributionType.DUTY },   //  fetch availabilities only with duty definitions 
          { '_work_unit': { $in: accepted_units } }             //  fetch availabilities related to accepted units
        ]
      },
      options: { sort: { start_time: 1 }}
    }, function (err, oPerson) {
      var days = {};

      // checking all availabilities
      async.eachSeries(oPerson._availabilities, function (availability, cb) {
        availability
          .populate({
            path: '_contributions.definition',
            select: 'category type designation available work_type'
          }, function (err, availability_populated) {
            if (moment(availability.start_time) < start_time && moment(availability.end_time) > start_time && availability.kind == 'notAvailable') {
              if (typeof days[0] == 'undefined') 
                days[0] = [availability_populated];
              else
                days[0].push(availability_populated);
            } else {
              if (typeof days[moment(availability.start_time).subtract(3, 'hours').dayOfYear() - moment(start_time).dayOfYear()] == 'undefined') 
                days[moment(availability.start_time).subtract(3, 'hours').dayOfYear() - moment(start_time).dayOfYear()] = [availability_populated];
              else 
                days[moment(availability.start_time).subtract(3, 'hours').dayOfYear() - moment(start_time).dayOfYear()].push(availability_populated);
              // if (typeof days[moment(availability.start_time).subtract(3, 'hours').isoWeekday()-1] == 'undefined') 
                // days[moment(availability.start_time).subtract(3, 'hours').isoWeekday()-1] = [availability_populated];
              // else 
                // days[moment(availability.start_time).subtract(3, 'hours').isoWeekday()-1].push(availability_populated);
            }

            cb();
          })
      }, function (err) {
        var user_days = []
          , week_total = 0;

        // Preparing days
        for (i = 0; i < 7; i++) {
          if (typeof user_days[i] == 'undefined') 
            user_days[i] = [];

          var combined_days = user_days[i];

          async.eachSeries(days[i] || [], function (d_availability, cba) {
            week_total += moment.duration(d_availability.end_time.getTime() - d_availability.start_time.getTime()).hours();

            var days_duration = moment.duration(d_availability.end_time.getTime() - d_availability.start_time.getTime()).days() + 1;
            if (d_availability.kind == 'notAvailable') {
              if (d_availability._contributions.length > 0 && typeof d_availability._contributions[0].definition.category != 'undefined') {
                var avStartTime = moment(d_availability.start_time).utcOffset(1)
                  , avEndTime = moment(d_availability.end_time).utcOffset(1);

                // special case for long absence from previous week
                if (avStartTime < start_time && avEndTime > start_time) {
                  avStartTime = start_time;
                  avStartTime.hours(5);
                }

                var endTime = avEndTime.locale('da').format("ddd HH.mm");
                if (moment.duration(avEndTime.milliseconds() - avStartTime.milliseconds()).hours() <= 8) {
                  endTime = avEndTime.format("HH.mm");
                }

                var t_availability = {
                  start_time: avStartTime.format("HH.mm"),
                  end_time: endTime,
                  absence: {
                    text: d_availability._contributions[0].definition.category
                  }
                }
                if (typeof d_availability._contributions[0].definition.work_type != 'undefined' && d_availability._contributions[0].definition.work_type != null) {
                  t_availability.work_type = d_availability._contributions[0].definition.work_type;
                }

                if (days_duration > 1) {
                  t_availability.start_time = moment(avStartTime).format("HH.mm");
                  t_availability.end_time = moment(avStartTime).locale('da').hours(23).minutes(0).add(6, 'hours').format("ddd HH.mm");

                  for (j = 1; j < days_duration; j++) {
                    if ((i+j) > 6) break;
                    if (typeof user_days[i+j] == 'undefined')
                      user_days[i+j] = [];

                    var day_start = moment(avStartTime).add(j, 'days').hours(5).minutes(0)
                      , day_end = moment(avStartTime).add(j, 'days').hours(23).add(6, 'hours');

                    var day_start_time
                      , day_end_time;

                    day_start_time = day_start;

                    day_end_time = (day_end < moment(d_availability.end_time))
                                      ? day_end
                                      : moment(d_availability.end_time);
                    
                    var preparedAvailability = {
                      start_time: day_start_time.utcOffset(1).format("HH.mm"),
                      end_time: day_end_time.utcOffset(1).locale('da').format("ddd HH.mm"),
                      absence: {
                        text: d_availability._contributions[0].definition.category,
                      }
                    }

                    if (typeof d_availability._contributions[0].definition.work_type != 'undefined' && d_availability._contributions[0].definition.work_type != null) {
                      preparedAvailability.work_type = d_availability._contributions[0].definition.work_type;
                    }

                    user_days[i+j].push(preparedAvailability);
                  }
                }

                // merge absence events in one day that goes one by one
                var exists = false;
                for (j = 0; j < combined_days.length; j++) {
                  if (typeof combined_days[j].absence != 'undefined' && combined_days[j].absence.text == t_availability.absence.text) {
                    exists = true;
                    combined_days[j].end_time = t_availability.end_time;
                  }
                }

                if (!exists)
                  combined_days.push(t_availability);
              }
              else
                combined_days.push({
                  start_time: moment(d_availability.start_time).utcOffset(1).format("HH.mm"),
                  end_time: moment(d_availability.end_time).utcOffset(1).format("HH.mm"),
                  absence: {
                    text: 'Description not available'
                  }
                });
            } else {
              var t_availability = {
                start_time: moment(d_availability.start_time).utcOffset(1).format("HH.mm"),
                end_time: moment(d_availability.end_time).utcOffset(1).format("HH.mm")
              };

              if (typeof d_availability._contributions[0].definition.work_type != 'undefined' && d_availability._contributions[0].definition.work_type != null) {
                t_availability.work_type = d_availability._contributions[0].definition.work_type;
              }

              combined_days.push(t_availability);
            }
            
            cba();
          }, function (err) {
            user_days[i] = combined_days;
          })
        }

        callback(null, user_days, week_total);
      })
    })
};

