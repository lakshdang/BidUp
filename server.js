// Import Dependencies
var http = require('http');
var express = require('express');
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var expressSession = require("express-session");
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var configAuth = require('./config/auth');
var pool = mysql.createPool(configAuth.db_connectionInfo);
require('./config/passport.js')(passport, pool);
// Initialize express app and set port
var port = process.env.PORT || 3000;
var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);
var expressSessionObj = expressSession({secret: 'anystringoftext',saveUninitialized: true,resave: true})
//Set Express middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(expressSessionObj);
app.use(passport.initialize());
app.use(passport.session());// persistent login sessions
app.use(flash());// use connect-flash for flash messages stored in session
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
io.use(function(socket, next){expressSessionObj(socket.request, {}, next);})

//Require routing logic
require('./app/routes.js')(app, passport, pool);
require('./app/auctionLogic.js')(io, passport);

//Start server
server.listen(port, function(){
	console.log("Server running on port: " + port);
})