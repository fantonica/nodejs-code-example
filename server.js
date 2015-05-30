var http = require('http');

var app = module.exports = require('./sources/server/lib/system/bootstrap');

/**
 * Start Server
 */
app.connect(function (err, connection) {
  app.initRouting();

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));

    app.all(function(){
      console.log(arguments)
    })
  });



});
