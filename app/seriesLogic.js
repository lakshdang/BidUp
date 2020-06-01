module.exports = function(pool){
	var apiSeriesLogic = require('./apiSeriesLogic')(pool)
	var apiPlayersLogic = require('./apiPlayersLogic')(pool)
	return{

		getUnplayableSeries: function(callback){
			pool.query('SELECT * FROM Series WHERE Playable=? AND SeriesStartDate>NOW()', [false], function(error, results, fields){
				if(error)return callback(error);
				return callback(null, results);
			})
		},

		getPlayableSeries: function(callback){
			pool.query('SELECT * FROM Series WHERE Playable=? AND SeriesStartDate>NOW()', [true], function(error, results, fields){
				if(error)return callback(error);
				return callback(null, results)
			})
		},

		addPlayableSeries: function(seriesId, callback){
			addPlayableSeriesPromise = apiSeriesLogic.addPlayableSeries(seriesId)
			addPlayableSeriesPromise.then((result)=>{
				return callback(null, result)
			}).catch((error)=>{
				return callback(error)
			})
		},

		getSeriesSquadsPromise: function(seriesId){
			return new Promise(function(resolve, reject){
				pool.query(getSeriesSquadQueryString, [seriesId], function(error, results){
					if(error)return reject(new Error("Backend Error"));
					return resolve(results);
				})
			})
		}
	}
}

function addSeriesTeams(seriesTeamsPairs, callback){
	pool.query('INSERT INTO SeriesTeams(SeriesID, TeamID) VALUES ?; SELECT * FROM SeriesTeams WHERE SeriesID=?', [seriesTeamsPairs], function(error, results, fields){
		if(error)return callback(error)
	})
}

var getSeriesSquadQueryString = `
SELECT * FROM SeriesSquadsInfo WHERE SeriesID = ?;
`;
