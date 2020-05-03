var cricapi = require("cricapi");
var axios = require('axios').default;
var util = require('util')
var mysql = require('mysql')

var connection = mysql.createConnection({
  host     : 'bidupdb.chojw49vb0kf.us-east-2.rds.amazonaws.com',
  user     : 'admin',
  password : 'PassMYSQL',
  database: 'BidUpData',
  multipleStatements: true
});

function isNormalInteger(str){
	var n = Math.floor(Number(str));
	return n !== Infinity && String(n) === str && n >= 0;
}
console.log(isNormalInteger("-1"))
console.log(isNormalInteger("2"))
console.log(isNormalInteger("2.1"))
console.log(isNormalInteger("10E2"))
console.log(isNormalInteger("+10"))
console.log(isNormalInteger("11.0"))
// qeury = "Select * from SeriesSquads join Players on SeriesSquads.PlayerID = Players.PlayerID"
// connection.connect()
// connection.qeury(qeury, function(err))
//get list of all matches
// optional parameters to limit number of upcoming, in progress and coompleted match counts
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/matches.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },
//     "params":{
//     "completedlimit":"1",
//     "inprogresslimit":"1",
//     "upcoming limit"
//     }
//     })
//     .then((response)=>{
//       console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })

// get list of series. Contains completed, future and in progress series
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/series.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     }
//     })
//     .then((response)=>{
//         series = response.data['seriesList']['series'].filter(series=>(series['status']=='UPCOMING'))
//         insertVals = []
//         // series = response.data['seriesList']['series']
//         for(i=0; i<series.length; i++)insertVals.push([series[i]["id"], series[i]["name"], (new Date(series[i]["startDateTime"])).toISOString().split('T')[0], (new Date(series[i]["endDateTime"])).toISOString().split('T')[0]])
//         // for(i=0; i<series.length; i++)series[i] = series[i]['id']
//         // series.sort()
//         connection.connect();
 
//         connection.query('INSERT INTO Series (SeriesApiID, SeriesName, SeriesStartDate, SeriesEndDate) VALUES ?', [insertVals], function (error, results, fields) {
//           if(error) throw error;
//           console.log(results);
//         });
         
//         connection.end();
//       // console.log(util.inspect(insertVals.length, false, null, true /* enable colors */))
//       // console.log(util.inspect(series, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })

// get list of teams participating in a series. Only gets names of teams and team ID. 
// required paramter of series ID which can be got from get series request.
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/seriesteams.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },"params":{
//     "seriesid":"2348"
//     }
//     })
//     .then((response)=>{
//         teams = response.data['seriesTeams']['teams']
//         insertVals=[]
//         for(i=0; i<teams.length; i++)insertVals.push(teams[i]["id"])
//         connection.connect();
 
//         connection.query('SELECT * FROM Teams WHERE TeamApiID in (?); Select * from Series where SeriesApiID=?', [insertVals, 2348], function (error, results, fields) {
//             if(error)throw error;

//             insertVals=[];
//             for(i=0; i<results[0].length; i++){insertVals.push([results[0][i]["TeamID"], results[1][0]["SeriesID"]])}
//             console.log(insertVals)
//             // console.log(TeamResults)
//             connection.query('INSERT into SeriesTeams (TeamID, SeriesID) VALUES ?', [insertVals], function(error, results, fields){
//                 if(error)throw error;
//                 console.log(results)
//                 connection.end();
//             })

//         });
//         // console.log(util.inspect(teams, false, null, true /* enable colors */))
//         // console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })


// get list of teams(same as above but for ipl 2018)
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/seriesteams.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },"params":{
//     "seriesid":"2429"
//     }
//     })
//     .then((response)=>{
//       console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })

// get a teams squad
// required parameter: team ID that can be got from series team request.
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/playersbyteam.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },"params":{
//     "teamid":"4"
//     }
//     })
//     .then((response)=>{
//       console.log(response)
//     })
//     .catch((error)=>{
//       console.log(error)
//     })

//get matches seriesID
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/matchseries.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },"params":{
//     "seriesid":"2348"
//     }
//     })
//     .then((response)=>{
//       console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })