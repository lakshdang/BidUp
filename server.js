// Import Dependencies
var express = require('express');

// Initialize express app and set port
var port = process.env.PORT || 3000;
var app = express();

//Set Express middleware
app.set('view engine', 'ejs');

//Require routing logic
require('./app/routes.js')(app);
//Start server
app.listen(port);
console.log("Server running on port: " + port);