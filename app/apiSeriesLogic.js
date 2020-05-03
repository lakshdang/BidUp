var axios = require('axios').default

module.exports = function(pool){
	var apiPlayersLogic = require('./apiPlayersLogic')(pool)
	return{
		addSeriesTeams: function(appSeriesId, callback){
			pool.query('SELECT SeriesApiID FROM Series WHERE SeriesId=?', [appSeriesId], function(error, results, fields){
				if(error)return callback(error);
				if(results.length==0)return callback(null, null);
				seriesApiId = results[0]['SeriesApiID']
				apiGetSeriesTeams(seriesApiId, function(error, teams){
					if(error)return callback(error);
					seriesTeams = []
					seriesTeamsApiId = []
					for(var i=0; i<teams.length; i++){
						seriesTeams.push([teams[i]['id'], teams[i]['name'], teams[i]['shortName'], teams[i]['logoUrl']])
						seriesTeamsApiId.push(teams[i]['id'])
					}
					pool.query('INSERT IGNORE INTO Teams (TeamApiID, TeamName, TeamShortName, TeamLogoURL) VALUES ?; SELECT * FROM Teams WHERE TeamApiID in (?)', [seriesTeams, seriesTeamsApiId], function(error, results, fields){
						if(error)return callback(error);
						return callback(null, results[1])
					})
				})
			})
		},

		addPlayableSeries: function(appSeriesId, callback){
			return new Promise((resolve, reject)=>{
				pool.query('SELECT SeriesApiID FROM Series WHERE SeriesId=?', [appSeriesId], function(error, results, fields){
					if(error)return reject(error);
					if(results.length==0)return resolve(true);
					seriesApiId = results[0]['SeriesApiID']
					apiGetSeriesTeams(seriesApiId, function(error, teams){
						if(error)return reject(error);
						seriesTeams = []
						seriesTeamsApiId = []
						for(var i=0; i<teams.length; i++){
							seriesTeams.push([teams[i]['id'], teams[i]['name'], teams[i]['shortName'], teams[i]['logoUrl']])
							seriesTeamsApiId.push(teams[i]['id'])
						}
						playersPromise = apiPlayersLogic.addSeriesPlayersPromise(seriesTeamsApiId)
						pool.query('INSERT IGNORE INTO Teams (TeamApiID, TeamName, TeamShortName, TeamLogoURL) VALUES ?; SELECT * FROM Teams WHERE TeamApiID in (?)', [seriesTeams, seriesTeamsApiId], function(error, teamsResults, fields){
							if(error)return reject(error);
							seriesTeams = []
							for(var i=0; i<teamsResults[1].length; i++)seriesTeams.push([appSeriesId, teamsResults[1][i]['TeamID']]);
							pool.query('INSERT INTO SeriesTeams(SeriesID, TeamID) VALUES ?; SELECT * FROM SeriesTeams JOIN Teams ON SeriesTeams.TeamID=Teams.TeamID WHERE SeriesTeams.SeriesID = ?', [seriesTeams, appSeriesId], function(error, seriesTeamsResults, fields){
								seriesTeamMap = {}
								for(var i=0; i<seriesTeamsResults[1].length; i++)seriesTeamMap[seriesTeamsResults[1][i]['TeamApiID']] = seriesTeamsResults[1][i]['SeriesTeamID'];
								playersPromise.then((players)=>{
									SeriesSquadInsertVals = new Array(players.length).fill(null)
									for(var i=0; i<players.length; i++) SeriesSquadInsertVals[i] = [players[i]['PlayerID'], seriesTeamMap[players[i]['TeamApiID']]];
									pool.query('INSERT INTO SeriesSquads(PlayerID, SeriesTeamID) VALUES ?; UPDATE Series SET Playable=? WHERE SeriesID = ?', [SeriesSquadInsertVals, true, appSeriesId], function(error, SeriesSquadsResults, feilds){
										if(error)return reject(error);
										return resolve(true)
									})
								}).catch((error)=>{
									return reject(error)
								})
							})
						})
					})
				})
			})
		}

	}
}

function apiGetSeriesTeams(seriesApiId, callback){
	axios({
	    "method":"GET",
	    "url":"https://dev132-cricket-live-scores-v1.p.rapidapi.com/seriesteams.php",
	    "headers":{
	    "content-type":"application/octet-stream",
	    "x-rapidapi-host":"dev132-cricket-live-scores-v1.p.rapidapi.com",
	    "x-rapidapi-key":"c141b2a916msh18ae88f0acdc9c5p194fc5jsn6e88ffc076c2"
	    },"params":{
	    "seriesid": seriesApiId
	    }
	})
	.then((response)=>{
		if(response.data.status=='no results')return callback(null, null)
		callback(null, response.data.seriesTeams.teams)
	})
	.catch((error)=>{
	    callback(error)
	})
}