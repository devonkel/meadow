var express = require('express'),
		jqupload = require('jquery-file-upload-middleware'),
    fortune = require("./lib/fortune.js"),
		// bootstrap = require('bootstrap'),
		bodyParser = require('body-parser');
		// cookieParser = require('cookie-parser');

var app = express();
var session = require('express-session');
var credentials = require('./credentials.js');

var handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options){
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3100);

app.use(express.static(__dirname + '/public'));

// app.use(require('cookie-parser')(credentials.cookieSecret));
// app.use(cookieParser(credentials.cookieSecret));

// app.use(require('express-session')());
app.use(session({
  secret: credentials.cookieSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

var formidable = require('formidable');
app.get('/contest/vacation-photo',function(req,res){
	var now = new Date();
	res.render('contest/vacation-photo',{
          year: now.getFullYear(),month: now.getMonth()
  });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		if(err) return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
    res.redirect(303, '/thank-you');
  });
});

app.use('/upload', function(req, res, next){
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir: function(){
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl: function(){
			return '/uploads/' + now;
		},
  })(req, res, next);
});

// app.use(require('body-parser')());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/newsletter', function(req, res){
// we will learn about CSRF later...for now, we just
// provide a dummy value
	res.render('newsletter', { csrf: 'Mahone' });
});

app.post('/process', function(req, res){
	var rqForm = req.query.form,
			rqName = req.body.name,
			rqEmail = req.body.email,
			rqCsrf = req.body._csrf;
	console.log('Form (from querystring): ' + rqForm);
	console.log('CSRF token (from hidden form field): ' + rqCsrf);
	console.log('Name (from visible form field): ' + rqName);
	console.log('Email (from visible form field): ' + rqEmail);

	if(! validEmail(rqEmail)) {
		if(req.xhr) return res.json({ error: 'Invalid name email address.' });
		req.session.flash = {
      type: 'danger',
      intro: 'Validation error!',
      message: 'The email address you entered was not valid.'
		};
		return res.redirect(303, '/newsletter');
	}
	else {
		if(req.xhr || req.accepts('json,html')==='json'){
	  	// if there were an error, we would send { error: 'error description' }
			res.send({ success: true });
		}
		else {
	  	// if there were an error, we would redirect to an error page
	  	res.redirect(303, '/thank-you');
		}
	}
});

app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') != 'production' &&
        req.query.test === '1';
    next();
});

app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

function validEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function getWeatherData(){
  return {
    locations: [
      {
        name: 'Frisco, TX',
        forecastUrl: 'http://www.wunderground.com/q/zmw:75035.1.99999?sp=KTXFRISC55',
        iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
        weather: 'Overcast',
        temp: '54.1 F (12.3 C)',
      },
      {
        name: 'New Orleans, LA',
        forecastUrl: 'http://www.wunderground.com/cgi-bin/findweather/getForecast?query=new+orleans',
        iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
        weather: 'Partly Cloudy',
        temp: '55.0 F (12.8 C)',
      },
      {
        name: 'Manzanita',
        forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
        iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
        weather: 'Light Rain',
        temp: '55.0 F (12.8 C)',
      },
    ],
  };
}

// middleware to add weather data to context
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherData = getWeatherData();
 	next();
});

app.get('/headers', function(req,res){
	res.set('Content-Type','text/plain');
	var s='';
	for(var name in req.headers)
		s += name + ': ' + req.headers[name] + '\n';
		res.send(s);
});

app.get('/jquery-test', function(req, res){
	res.render('jquery-test');
});

app.get('/nursery-rhyme', function(req, res){
	res.render('nursery-rhyme');
});

app.get('/thank-you', function(req, res){
	res.render('thank-you');
});

app.get('/data/nursery-rhyme', function(req, res){
  res.json({
  	animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck',
	});
});

app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
  res.render('tours/request-group-rate');
});

app.get('/', function(req, res){
    res.render('home');
});
app.get('/home', function(req, res){
    res.render('home');
});
app.get('/contacts', function(req, res) {
    res.render('contacts');
});

app.get('/about', function(req, res){
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

// custom 404 page
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});
