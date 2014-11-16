var express = require('express'),
    route = require('./jsRoutes/index'),
    http = require('http'),
    path = require('path'),
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
app.use(express.cookieParser('secret'));
app.use(express.session()); 
app.use(express.static(__dirname + '/public'));
app.use('/article',express.static(__dirname + '/public'));

app.get('/', route.index);
app.get('/article/:id',route.renderDetail);


app.listen(app.get('port') , function(){
	console.log('yeah~ on : ' + app.get('port'));
});
