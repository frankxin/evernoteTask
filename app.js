var express = require('express'),
	route = require('./jsRoutes/index'),
	http = require('http'),
	hbs = require('hbs');

//just for test
// var jsroute = require('./jsRoutes/main');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.engine('html', hbs.__express);

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//if have oauth , to store some info in session
app.use(express.cookieParser('secret'));
app.use(express.session());
//why i should have to set two times for static 
app.use(express.static(__dirname + '/public'));
app.use('/article', express.static(__dirname + '/public'));

//router
app.get('/', route.index);
app.get('/article/:id', route.renderDetail);

//default listen on 3000 port
app.listen(app.get('port'), function() {
	console.log('yeah~ on : ' + app.get('port'));
});
