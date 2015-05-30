var View = require('../models/view')
  , secure = require('../lib/secure');

module.exports = function (app) {

  app.get('/', function (req, res) {
    res.redirect(secure.paths.ADMIN_INDEX)
  });

  app.get('/employee', function (req, res) {
    res.render('default/view/employee.html');
  });

  app.get('/patient', function (req, res) {
    res.render('default/view/patient.html');
  });

  app.get('/patient/week', function (req, res) {
    res.render('default/view/patient-week.html');
  });

  /*
   * Fetching view template type by view id
   */
  app.get('/:view_id', function (req, res) {
    var view_id = req.params.view_id;

    View
      .findOne({ _id: view_id }, '_id type')
      .exec(function (err, view) {
        if (view) {
          var viewName = '';

          switch (view.type) {
            case View.types.codes.EMPLOYEE_WEEK:
              viewName = 'employee';
              break;

            case View.types.codes.PATIENT_WEEK:
              viewName = 'patient-week';
              break;

            case View.types.codes.PATIENT_DAY:
              viewName = 'patient';
              break;
          }

          res.render('default/view/'+ viewName +'.html');
        } else {
          res.sendStatus(404);
        }
      })
  });

  // Configuring render templates for angular as for default view folder
  app.get('/view/:name', function (req, res) { res.render('../views/' + req.params.name); });
  app.get('/view/:name/:subname', function (req, res) { res.render('../views/default/' + req.params.name + '/' + req.params.subname); });
  
  app.get('/view/:app_name/:controller/:action_name', function (req, res) { res.render('../views/' + req.params.app_name + '/' + req.params.controller + '/' + req.params.action_name); });

  // redirect all others to the index (HTML5 history)
  // app.get('*', function (req, res) {
    // res.render('index');
  // });
  
}
