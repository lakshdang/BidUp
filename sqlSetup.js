var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'bidupdb.chojw49vb0kf.us-east-2.rds.amazonaws.com',
  user     : 'admin',
  password : 'PassMYSQL',
  database: 'BidUpData'
});

connection.connect();
 
connection.query('SELECT * from Series', function (error, results, fields) {
  if (error) throw error;
  console.log(results);
});
 
connection.end();