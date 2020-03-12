// Import Dependencies
var express = require('express');
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
require('./config/passport.js')(passport);

// Initialize express app and set port
var port = process.env.PORT || 3000;
var app = express();

//Set Express middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(expressSession({secret: 'anystringoftext',
				 saveUninitialized: true,
				 resave: true}));
app.use(passport.initialize());
app.use(passport.session());// persistent login sessions
app.use(flash());// use connect-flash for flash messages stored in session
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');

//Require routing logic
require('./app/routes.js')(app, passport);

//Start server
app.listen(port);
console.log("Server running on port: " + port);