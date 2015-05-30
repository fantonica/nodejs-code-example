var async = require('async');

module.exports = function (app) {
  
  app.get('/user/get', function (req, res) {
    res.json({ 
      success: true, 
      message: "controller works well" 
    });
  });

}
