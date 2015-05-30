var async = require('async')
  , moment = require('moment')
  , Person = require('../models/person')
  , PersonViewHelper = require('../lib/helper/view/person')
  , GroupViewHelper = require('../lib/helper/view/view_group')
  , View = require('../models/view')
  , ViewGroup = require('../models/view_group')
  , Unit = require('../models/unit');

module.exports = function (app) {
  app.get('/api/view/week', function (req, res) {
    var view_id = req.query.view
      , week = req.query.week
      , group = req.query.group;

    var firstWeekDay = moment().week(week).isoWeekday(1).hours(0).minutes(0)
      , lastWeekDay = moment().week(week).isoWeekday(7).hours(23).minutes(30);

    var _options = {};

    View
      .findOne({ _id: view_id })
      .populate({
        path: 'groups.group',
      })
      .exec(function (err, view) {
        if (view) {
          _options = (view && typeof view._options != 'undefined') ? view._options : {};

          GroupViewHelper.getWeekGroupsView(view, firstWeekDay, lastWeekDay, group, function (groups) {
            res.json({ 
              week: week,
              groups: groups,
              _options: _options
            });
          })
        } else {
          res.json({
            success: false,
            message: "View doesn't exists"
          })
        }
      })
  });

  app.get('/api/view/patient/week', function (req, res) {
    var view_id = req.query.view
      , startDay = req.query.start_day || new Date()
      , group = req.query.group;

    var firstWeekDay = moment(startDay).hours(0).minutes(0)
      , lastWeekDay = firstWeekDay.clone().add(6, 'days').hours(23).minutes(30);

    var _options = {};

    View
      .findOne({ _id: view_id })
      .populate({
        path: 'groups.group'
      })
      .exec(function (err, view) {
        if (view) {
          _options = (typeof view._options != 'undefined') ? view._options : {};
          
          GroupViewHelper.getWeekGroupsView(view, firstWeekDay, lastWeekDay, group, function (groups) {
            res.json({ 
              week: moment().week(),
              groups: [groups[0]],
              _options: _options
            });
          })
        } else {
          res.json({
            success: false,
            message: "View doesn't exists"
          })
        }
      })
  });

  app.get('/api/view/day', function (req, res) {
    var view_id = req.query.view
      , day = req.query.day || moment().format('YYYY-MM-DD')
      , start_hour = req.query.start_hour || '5'
      , hours = req.query.hours || 4
      , currentHour = req.query.c_hour || moment().hours()
      , currentMinute = req.query.c_minute || moment().minutes();
    
    var currentTime = moment(day).hours(currentHour).minutes(currentMinute);

    var timeStamp = day + " " + start_hour;

    var startTime = moment(timeStamp, "YYYY-MM-DD HH")
      , endTime = moment(timeStamp, "YYYY-MM-DD HH").add(hours, 'hours');

    // var groups = [];

    var info = {
      day: day
    };

    // dag    07:00-15:15     start_hour: 5
    // aften  15:15-23:00     start_hour: 15
    // nat    23:00-07:00     start_hour: 22
    
    var dagStartTime = moment(day + " 7:00", "YYYY-MM-DD HH:mm")
      , dagEndTime = moment(day + " 15:15", "YYYY-MM-DD HH:mm")
      , aftenStartTime = moment(day + " 15:15", "YYYY-MM-DD HH:mm")
      , aftenEndTime = moment(day + " 22:45", "YYYY-MM-DD HH:mm")
      , natStartTime = moment(day + " 22:45", "YYYY-MM-DD HH:mm")
      , natEndTime = moment(day + " 23:00", "YYYY-MM-DD HH:mm").add(8, 'hours');

    var startPointShift = null;
    if (currentTime >= dagStartTime && currentTime < dagEndTime) {
      startPointShift = dagStartTime;
    } else if ((currentTime >= aftenStartTime && currentTime < aftenEndTime)) {
      startPointShift = aftenStartTime;
    } else if ((currentTime >= natStartTime && currentTime < natEndTime)) {
      startPointShift = natStartTime;
    } else if (currentTime < dagStartTime) {
      // to show previous day night shifts
      startPointShift = natStartTime.subtract(1, 'days');
    }
    
    var shifts = [];

    if (startPointShift.hours() == 22) {
      startPointShift.hours(23);
    } 

    for (i = 0; i < 3; i++) {
      var startShift = startPointShift.clone()
        , endShift = startPointShift.clone()
        , typeShift = null;

      startShift.add(i*8, 'hours').minutes(0)
      endShift.add((i + 1)*8, 'hours').minutes(0);

      if (startShift.hours() == 15) startShift.minutes(15);
      if (endShift.hours() == 15) endShift.minutes(15);
      if (startShift.hours() == 23) startShift.hours(22).minutes(45);
      if (endShift.hours() == 23) endShift.hours(22).minutes(45);

      if (startShift.hours() == 7) typeShift = 'dag';
      if (startShift.hours() == 15) typeShift = 'aften';
      if (startShift.hours() == 22) typeShift = 'nat';

      shifts.push([typeShift, startShift, endShift]);
    }

    View
      .findOne({ _id: view_id })
      .populate({
        path: 'groups.group',
      })
      .exec(function (err, view) {
        if (view) {
          var order = 0;
          async.eachSeries(shifts, function (shift, callback) {
            GroupViewHelper.getDayGroupsView(view, shift[1], shift[2], currentTime, function (_groups) {
              info[shift[0]] = {
                order: order, 
                groups: _groups
              }

              order++;

              callback();
            })
          }, function (err) {
            info._options = (view && typeof view._options != 'undefined') ? view._options : {};
            
            res.json(info);
          })
        } else {
          res.json({
            success: false,
            message: "View doesn't exists"
          })
        }
      })
  });
  
  
  app.get('/api/view/list', function (req, res) {
    var list = [];
    View.find().exec(function (err, views) {
      async.each(views, function (view, callback) {
        list.push({
          id: view._id,
          name: view.name
        });
        callback();
      }, function (err) {
        res.json(list);
      })
    })
  })

  

  app.get('/api/view/units', function (req, res) {
    var list = [];
    Unit.find().exec(function (err, units) {
      async.each(units, function (unit, callback) {
        list.push({
          unit_id: unit.id,
          text: unit.text
        });
        callback();
      }, function (err) {
        res.json(list);
      })
    })
  });

}
