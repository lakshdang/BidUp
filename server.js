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
var mysqlSessionStore = require('express-mysql-session')(expressSession);
var passportSocketIo = require("passport.socketio");
var configAuth = require('./config/auth');
var pool = mysql.createPool(configAuth.db_connectionInfo);
require('./config/passport.js')(passport, pool);
var sessionStore = new mysqlSessionStore({}, pool);

// Initialize express app, set port, initialize http server and initialize socket io
var port = process.env.PORT || 3000;
var app = express();
var server = http.Server(app);
var io = require("socket.io")(server);

//Set Express middleware
var expressSessionObj = expressSession({
	store: sessionStore,
	secret: 'anystringoftext',
	saveUninitialized: true,
	resave: true})
app.use(morgan('dev'));
app.use(cookieParser());
app.use(expressSessionObj);
app.use(passport.initialize());
app.use(passport.session());// persistent login sessions
app.use(flash());// use connect-flash for flash messages stored in session
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// io.use(function(socket, next){expressSessionObj(socket.request, {}, next);})
io.use(passportSocketIo.authorize({
	cookieParser: cookieParser,
	key: 'connect.sid',
	secret: 'anystringoftext',
	store: sessionStore,
	passport: passport}))

//Require routing logic
require('./app/routes.js')(app, passport, pool);
require('./app/auctionSocketLogic.js')(io, pool);

//Server Static Files
app.use('/Viewsjs', express.static(__dirname + '/views/js'));
app.use('/css', express.static(__dirname + '/views/css'));

//Start server
server.listen(port, function(){
	console.log("Server running on port: " + port);
})