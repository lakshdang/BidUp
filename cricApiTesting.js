var cricapi = require("cricapi");
var axios = require('axios').default;
var util = require('util')


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

//get list of series. Contains some completed and future and in progress series
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
//       console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })

// get list of teams participating in a series. ONly gets names of teams and team ID. 
// required paramter of series ID which can be got from get series request.
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/seriesteams.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },"params":{
//     "seriesid":"2382"
//     }
//     })
//     .then((response)=>{
//       console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })


//get list of teams(same as above but for ipl 2018)
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/seriesteams.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },"params":{
//     "seriesid":"2141"
//     }
//     })
//     .then((response)=>{
//       console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })

// get a teams squad
// required parameter: team ID that can be got from series team request. Here for mumbai indians
axios({
    "method":"GET",
    "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/playersbyteam.php",
    "headers":{
    "content-type":"application/octet-stream",
    "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
    "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
    },"params":{
    "teamid":"4"
    }
    })
    .then((response)=>{
      console.log(util.inspect(response.data, false, null, true /* enable colors */))
    })
    .catch((error)=>{
      console.log(error)
    })

//get matches seriesID
// axios({
//     "method":"GET",
//     "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/matchseries.php",
//     "headers":{
//     "content-type":"application/octet-stream",
//     "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
//     "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
//     },"params":{
//     "seriesid":"2141"
//     }
//     })
//     .then((response)=>{
//       console.log(util.inspect(response.data, false, null, true /* enable colors */))
//     })
//     .catch((error)=>{
//       console.log(error)
//     })