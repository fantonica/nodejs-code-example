var async = require('async')
  , secure = require('../../lib/secure')
  , Unit = require('../../models/unit')
  , Person = require('../../models/person')
  , User = require('../../models/user');

module.exports = function (app) {
  /*
   * Getting Units list, all or only accepted to current user
   */
  app.get("/api/admin/unit/list", secure.isAuthenticated(), function (req, res) {
    var showAccepted = (req.query.accepted == 'true') ? true : false
      , showPersons = (req.query.persons == 'true') ? true : false;

    var clauseQuery = (!showAccepted)
      ? { text: {'$ne': null } }
      : { text: {'$ne': null }, _id: { $in: req.user.units.accepted } };


    var visibleQuery = '_id id text';
    if (showPersons) 
      visibleQuery += ' _persons';

    var query = 
      Unit
        .find(clauseQuery, visibleQuery)
        .sort('text');

    if (showPersons) {
      var currentTime = new Date();

      query = query.populate({
        path: '_persons', 
        match: {
          $and: [
            { valid_from: { $lt: currentTime } },
            { valid_to: { $gt: currentTime } }
          ],
          deleted: false
        },
        select: '_id first_name second_name initials',
        options: { sort: { "first_name": 1 } }
      })
    }
    
    query.exec(function (err, units) {
      res.json(units);
    })
  });

  /*
   * Getting unit persons lists for allowed unit
   */
  app.get('/api/admin/unit/:id/persons', secure.isAuthenticated(), function (req, res) {
    var unit_id = req.params.id;

    if (req.user.role != User.roles.codes.ADMIN && req.user.units.accepted.indexOf(unit_id) == -1) {
      res.sendStatus(401);
    } else {
      Unit
        .findOne({ 
          _id: unit_id
        })
        .populate({
          path: '_persons',
          select: '_id id first_name second_name initials image_url _planning_info',
          match: {
            valid_to: { $gt: new Date() },
            deleted: false
          },
          options: { sort: { initials: 1 } }
        })
        .exec(function (err, unit) {
          var persons = [];

          async.eachSeries(unit._persons, function (person, callback) {
            person.populate({
              path: '_planning_info',
              match: {
                _section_unit: unit._id,
                validity_start: { $lt: new Date() },
                validity_end: { $gt: new Date() },
                deleted: false
              }
            }, function (err, person_info) {
              if (person_info._planning_info && person_info._planning_info.length > 0) {
                persons.push({
                  _id: person_info._id,
                  id: person_info.id,
                  first_name: person_info.first_name,
                  second_name: person_info.second_name,
                  initials: person_info.initials,
                  image_url: person_info.image_url
                });
              }
              callback();
            });
          }, function (err) {
            res.json({
              success: true,
              data: persons
            })
          })
        })
    }
  });

};
