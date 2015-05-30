var async = require('async')
  , Person = require('../../models/person')
  , Unit = require('../../models/unit')
  , bodyParser = require('body-parser')
  , fs = require('fs')
  , sys = require('sys');

module.exports = function (app) {
  var S3 = require('../../lib/helper/s3').init(app);

  var urlencodedParser = bodyParser.urlencoded({
      extended: false,
      limit: '50mb',
      defer: true
  });


  app.get('/api/admin/person/list', function (req, res) {
    Person
      .find(
        { 
          deleted: false,
          valid_from: { $lt: new Date() },
          valid_to: { $gt: new Date() }
        }, 
        'id first_name second_name image_url initials skills'
      )
      .sort('initials')
      .exec(function (err, persons) {
        res.json(persons);
      });
  });

  /**
   * Upload image api via base64
   */
  app.post('/api/admin/person/upload_image', urlencodedParser, function (req, res) {
    var imgContent = req.body.img
      , personId = req.body.id
      , fileName = req.body.filename;

    var s3 = S3.getObject();

    var match = imgContent.match(/^data:(.*?)\/(.*?);base64/)
      , data = imgContent.replace(/^data:image\/\w+;base64,/, "");

    var base64Data = new Buffer(data, 'base64');

    var params = {
      Bucket: S3.getBucketKey(S3.buckets.PROFILE),
      Body: base64Data,
      ACL: 'public-read',
    };

    if (typeof match[1] != 'undefined') {
      params.ContentLength = Buffer.byteLength(data, 'base64');
      params.ContentType = match[1] + '/' + match[2];
    }

    Person
      .findOne({ _id: personId })
      .exec(function (err, person) {
        if (!person) {
          res.json({
            success: false,
            message: "User doesn't exists"
          })
        } else {
          var fileKey = person.id + '.' + match[2];
          params.Key = fileKey;

          s3.putObject(params, function (perr, pres) {
            if (perr) {
                res.json({ succes: false, message: perr })
            } else {
              var url = "https://" + S3.getBucketKey(S3.buckets.PROFILE) + ".s3.amazonaws.com/" + fileKey;

              person.set('image_url', url);
              person.set('image_key', fileKey);

              person.save(function (err) {
                if (!err) {
                  res.status(200).write(JSON.stringify({ 
                    success: true,
                    data: {
                      imgUrl: url
                    }
                  }));
                  res.end();
                } else {
                  res.write(JSON.stringify({ 
                    success: false,
                    message: err
                  }));
                  res.end();
                }
              })
            }
          });
        }
      })
  });

  app.get('/api/admin/person/image_url', function (req, res) {
    var s3 = S3.getObject();

    var url = s3.getSignedUrl('getObject', { Bucket: S3.getBucketKey(S3.buckets.PROFILE), Key: req.query.name });

    res.json({
      url: url
    })
  });

  /*
   * Update person info
   */
  app.post('/api/admin/person/update', function (req, res) {
    var _id = req.body.id
      , first_name = req.body.first_name
      , second_name = req.body.second_name
      , initials = req.body.initials
      , skills = req.body.skills;

    Person
      .findOne({ _id: _id })
      .exec(function (err, person) {
        if (person) {
          if (first_name) {
            person.set('first_name', first_name);
          }
          if (second_name) {
            person.set('second_name', second_name);
          }
          if (initials) {
            person.set('initials', initials);
          }
          if (typeof skills != 'undefined') {
            person.set('skills', skills);
          }

          person.save(function (err) {
            (err == null)
              ? res.json({ success: true })
              : res.json({ success: false, message: err });
          })
        } else {
          res.json({
            success: false, 
            message: "Person doesn't exists"
          })
        }
      })

  });

  app.get('/api/admin/person/without_image', function (req, res) {
    var units = req.query.units || '90H,90I,90J,90K,90L,8W6';
    units = units.split(',');

    var persons = [];

    async.eachSeries(units, function (unit_id, cb) {
      Unit
        .findOne({ id: unit_id })
        .populate('_persons')
        .exec(function (err, unit) {
          if (unit) {
            async.eachSeries(unit._persons, function (_person, cba) {
              _person
                .populate({
                  path: '_planning_info',
                  match: {
                    section_unit_id: unit_id,
                    validity_start: { $lt: new Date() },
                    validity_end: { $gt: new Date }
                  }
                }, function (err, person) {
                  if (person._planning_info.length > 0 && (typeof person.image_url == 'undefined' || !person.image_url))
                    persons.push({
                      id: person.id,
                      first_name: person.first_name,
                      second_name: person.second_name
                    })
                  
                  cba();
                });
            }, function (err) {
              cb();
            })
          } else {
            cb();
          }
        })
    }, function (err) {
      res.json(persons);
    })
  });

  app.post('/api/admin/person/remove_image', function (req, res) {
    var s3 = S3.getObject();

    var personId = req.body.id;

    Person
      .findOne({ _id: personId })
      .exec(function (err, person) {
        if (person && person.image_key) {
          var params = {
            Bucket: S3.getBucketKey(S3.buckets.PROFILE),
            Delete: { 
              Objects: [
                {
                  Key: person.image_key
                },
              ]
            }
          };

          s3.deleteObjects(params, function (err, data) {
            if (err) {
              res.json({ success: false, message: err.stack });
            } else {
              person.set('image_key', null);
              person.set('image_url', null);
              person.save(function (err) {
                res.json({ success: true });
              })
            }
          });
        } else {
          res.json({ success: false, message: "Person doesn't have image associated" });
        }
      })
  })
}
