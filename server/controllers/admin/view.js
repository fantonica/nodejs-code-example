var async = require('async')
  , View = require('../../models/view')
  , ViewGroup = require('../../models/view_group')
  , Unit = require('../../models/unit')
  , User = require('../../models/user');

module.exports = function (app) {
  app.get("/api/admin/view/list", function (req, res) {
    async.waterfall([
      function (callback) {
        View.find()
          .exec(function (err, views){
            callback(err, views)
          });
      },
      function (views, callback) {
        var views_list = [];

        if (req.user.role == User.roles.codes.ADMIN) {
          callback(null, views);
        } else {
          User.findOne({ _id: req.user._id }).exec(function (err, user) {
            async.eachSeries(views, function (view, cb) {
              var intersect = view.units.exists.filter(function (n) {
                return user.units.accepted.indexOf(n) != -1
              });

              if (intersect.length > 0)
                views_list.push(view);

              cb();

            }, function (err) {
              callback(null, views_list);
            })
          })
        }
      }
    ], function (err, views) {
      res.json(views);
    });
  });


  app.post('/api/admin/view/save', function (req, res) {
    var name = req.body.name
      , type = req.body.type
      , groups = req.body.groups    // stored list of users
      , isFullName = req.body.is_full_name
      , isPhotoVisible = req.body.is_photo_visible;


    // proceed with groups 
    // groups = [
    //  { _id: unit._id, name: Gruppe 1, persons: [person._id, person._id] },
    //  { _id: unit._id, name: Gruppe 2, persons: [person._id, person._id, person._id] },
    // ]
    
    // proceed with creating view
    // 
    // NOTE: Store all units that contain view in view = units.exists
    

  });

  app.get('/api/admin/view/types', function (req, res) {
    res.json({
      success: true,
      data: {
        types: View.types.titles
      }
    });
  })

  /*
   * Save name and type
   */
  app.post('/api/admin/view/save/name', function (req, res) {
    var id = req.body.id
      , name = req.body.name
      , type = req.body.type;

    async.waterfall([
      function (callback) {
        if (id) {
          View
            .findOne({ _id: id })
            .exec(callback)
        } else {
          callback(null, null);
        }
      },
      function (view, callback) {
        if (view) {
          if (name)
            view.set('name', name);
          if (type)
            view.set('type', type);
        } else {
          view = new View({
            name: name,
            type: type
          })
        }

        view.set('url', view.generateUrl());

        view.save(function (err, view_instance) {
          callback(err, view_instance);
        })
      }
    ], function (err, view) {
      var response = {};

      if (err) {
        response = { 
          success: false,
          message: err
        }
      } else {
        response = {
          success: true,
          data: {
            id: view.id
          }
        }
      }

      res.json(response)
    });
  });

  app.post('/api/admin/view/save/groups', function (req, res) {
    var id = req.body.id
      , groups = newGroups = req.body.groups || [];

    if (groups.length == 0)
      res.json({
        success: false,
        message: "Should be selected atleast 1 group"
      })
    else 
      View
        .findOne({ _id: id })
        .populate({
          path: 'groups.group',
        })
        .exec(function (err, view) {
          if (view) {
            var removeGroupIndex = []
              , removeGroup = [];

            async.eachSeries(view.groups, function (group_info, callback) {
              var groupPosition = groups.indexOf(''+group_info.group.base_unit);

              if (groupPosition == -1) {
                removeGroupIndex.push(group_info._id);
                removeGroup.push(group_info.group._id);
              } else {
                newGroups.splice(groupPosition, 1);
              }

              callback();
            }, function (err) {  
              async.waterfall([
                function (callback) {
                  async.eachSeries(removeGroup, function (rGroup, cba) {
                    ViewGroup
                      .findById(rGroup)
                      .exec(function (err, group) {
                        if (group) {
                          view.units.exists.pull({ _id: group.base_unit });
                          view.groups.pull({ _id: removeGroupIndex[removeGroup.indexOf(rGroup)] });
                          group.remove(function (err) {
                            cba();
                          })
                        } else {
                          cba();
                        }
                      })
                  }, function (err) {
                    view.save(function (err, oView) {
                      callback(err, oView);
                    })
                  })
                }, 
                function (oView, callback) {
                  var currentTime = new Date();

                  async.eachSeries(newGroups, function (aGroup, cba) {
                    Unit
                      .findById(aGroup)
                      .populate({
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
                      .exec(function (err, unit) {
                        if (unit) {
                          var persons = [];

                          unit._persons.forEach(function (person) {
                            persons.push({
                              person: person._id,
                              accepted_units: [unit._id]
                            });
                          })

                          var viewGroup = new ViewGroup({
                            name: unit.text,
                            base_unit: unit._id,
                            persons: persons,
                          })

                          viewGroup.save(function (err, oViewGroup) {
                            oView.groups.push({ group: oViewGroup._id });
                            oView.units.exists.push(oViewGroup.base_unit)
                            cba();
                          })
                        } else {
                          cba();
                        }
                      })
                  }, function (err) {
                    oView.save(function (err, viewInstance) {
                      callback(err, viewInstance);
                    })
                  })
                }
              ], function (err, oView) {
                oView.populate('groups.group', 'persons.person name base_unit', function (err, viewPopulated) {
                  res.json({
                    success: true,
                    data: {
                      view: viewPopulated.groups
                    }
                  })
                })
              })
            })
          } else {
            res.json({
              success: false,
              message: "View doesn't exists"
            })
          }

        })
  });

  app.post('/api/admin/view/save/persons', function (req, res) {
    var id = req.body.id
      , groups = newGroups = req.body.groups;

    // id = view_id,
    // groups = [
    //  { _id: 'qsdadfsdf', name: 'Group Name', persons: ['asdasd', 'asdsdfdfg'] }
    // ]

    View
      .findOne({ _id: id })
      .populate({
        path: 'groups.group',
      })
      .exec(function (err, view) {
        if (view) {
          var errors = {};
          async.eachSeries(groups, function (group, callback) {
            view.groups.forEach(function (group_info) {
              if (group_info.group._id == group._id) {
                var persons = [];

                group.persons.forEach(function (person) {
                  persons.push({
                    person: person,
                    accepted_units: [group_info.group.base_unit]
                  })
                })

                group_info.group.set('persons', persons);
                group_info.group.set('name', group.name);

                group_info.group.save(function (err, groupSaved) {
                  if (err) 
                    errors[group_info.group._id] = err;
                  callback()
                })
              }
            });
          }, function (err) {
            (Object.keys(errors).length == 0)
              ? res.json({ success: true })
              : res.json({ success: false, message: errors });
          })
        } else {
          res.json({
            success: false,
            message: "View doesn't exists"
          })
        }
      })
  })

  app.post('/api/admin/view/save/options', function (req, res) {
    var id = req.body.id
      , options = req.body.options;

    View
      .findOne({ _id: id })
      .exec(function (err, view) {
        if (view) {
          if (typeof options.show_photos != 'undefined')
            view.set('_options.show_photos', options.show_photos);
          if (typeof options.show_fullname != 'undefined')
            view.set('_options.show_fullname', options.show_fullname);
          if (typeof options.show_skills != 'undefined')
            view.set('_options.show_skills', options.show_skills);
          if (typeof options.days_ahead != 'undefined')
            view.set('_options.days_ahead', options.days_ahead);

          view.save(function (err, viewSaved) {
            (err == null)
              ? res.json({ success: true, data: {
                  url: app.get('config').domain + '/' + id
                } })
              : res.json({ success: false, message: err });
          })
        } else {
          res.json({
            success: false,
            message: "View doesn't exists"
          })
        }
      });
  })

  app.get('/api/admin/view/:id/get', function (req, res) {
    var id = req.params.id;

    View
      .findOne({ _id: id }, '_id name type groups _options status url')
      .populate({
        path: 'groups.group',
        select: '_id base_unit name persons'
      })
      .exec(function (err, view) {
        if (view) {
          res.json(view);
        } else {
          res.json({
            success: false,
            message: "View doesn't exists"
          })
        }
      });
  })

  app.post('/api/admin/view/delete', function (req, res) {
    var id = req.body.id;

    View
      .findOne({ _id: id })
      .exec(function (err, view) {
        if (view) {
          var groups = [];

          view.groups.forEach(function (group_info) {
            groups.push(group_info.group);
          })

          ViewGroup
            .remove({ _id: { $in: groups } })
            .exec(function (err) {
              view.remove(function (err) {
                (err == null)
                  ? res.json({ success: true })
                  : res.json({ success: false, message: err });
              })
            })
        } else {
          res.json({
            success: false,
            message: "View doesn't exists"
          })
        }
      });
  })

};
