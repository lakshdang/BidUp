var axios = require('axios').default;
var util = require('util')

promises = []

function getApiPlayerCallPromise(apiTeamId){
	console.log('Fetching Players for team: ', apiTeamId)
	return axios
	({
		"method":"GET",
		"url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/playersbyteam.php",
		"headers":{
		"content-type":"application/octet-stream",
		"x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
		"x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
		},"params":{
		"teamid":apiTeamId
		}
	})
}

for(var i=1; i<6; i++){
	console.log('Starting Promise: ', i)
	promises.push(getApiPlayerCallPromise(i))
}

Promise.all(promises).then(function(values){
	console.log(util.inspect(values[0].data, false, null, true /* enable colors */))
}).catch(function(error){
	console.log(error)
})