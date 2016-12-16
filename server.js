var express = require('express'),
    app = express();
// app.use(express.static('www'));
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/dist',  express.static(__dirname + '/dist'));
// app.use(express.static(__dirname));

app.set('port', process.env.PORT || 6060);
app.listen(app.get('port'), function () {
	    console.log('Express server listening on port ' + app.get('port'));
});
