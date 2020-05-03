var axios = require('axios').default
var util = require('util')

module.exports = function(pool){
	return{
		addSeriesPlayersPromise(apiTeamIds){
			return new Promise((resolve, reject)=>{
				playerApiCallPrmoises = []
				for(var i=0; i<apiTeamIds.length; i++){
					playerApiCallPrmoises.push(getApiPlayerCallPromise(apiTeamIds[i]))
				}
				Promise.all(playerApiCallPrmoises).then(function(values){
					players = []
					playerApiIds = []
					playerApiTeamIds = []
					for(var i=0; i<values.length; i++){
						if(values[i].data.status!=200)continue;
						teamPlayersApiData = values[i].data['teamPlayers']['players']
						temp = teamPlayersApiData.map(({playerId, fullName, playerType})=>([playerId, fullName, playerType]))
						players=players.concat(temp);
						playerApiIds = playerApiIds.concat(values[i].data['teamPlayers']['players'].map(({playerId})=>(playerId)))
						playerApiTeamIds = playerApiTeamIds.concat(new Array(teamPlayersApiData.length).fill(apiTeamIds[i]))
					}
					pool.query("INSERT IGNORE INTO Players(PlayerApiID, PlayerName, PlayerType) VALUES ?; SELECT * FROM Players WHERE PlayerApiID in (?); ", [players, playerApiIds], function(error, playerResults, fields){
						if(error)return reject(error);
						playerResults = playerResults[1]
						for(var i=0; i<playerResults.length; i++)playerResults[i]['TeamApiID'] = playerApiTeamIds[i];
						return resolve(playerResults)
					})
				})
			})
		}
	}
}

function getApiPlayerCallPromise(apiTeamId){
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