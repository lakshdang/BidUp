module.exports = function(pool){
	return{
		joinLeague: function(leagueIdData, userData, callback){
			joinLeague(pool, leagueIdData, userData, callback)
		},

		createLeague: function(leagueData, leagueAdminData, callback){
			insertVals = [leagueAdminData['UserID'], leagueData['series'], leagueData['maxUsers'], leagueData['squadBudget'], leagueData['numPlayers'], leagueData['minBowler'], leagueData['minWicketKeep'], leagueData['leagueName']]
			leagueName = leagueData['leagueName'].trim().toLowerCase()
			pool.query('SELECT LeagueName FROM Leagues Where LOWER(LeagueName)=?', [leagueName], function(error, results, fields){
				if(error)return callback(error);
				if(results.length>0)return callback(null, false);
				pool.query('INSERT INTO Leagues(LeagueAdminUserID, SeriesID, MaxUserTeams, TeamBudget, NumPlayers, MinBowler, MinWicketKeep, LeagueName) VALUES (?); SELECT * FROM Leagues Where LOWER(LeagueName)=?',[insertVals, leagueName], function(error, results, fields){
					if(error)return callback(error);
					return joinLeague(pool, {"leagueId": results[1][0]['LeagueID']}, leagueAdminData, callback)
				})
			})
		},

		getUserLeagues(userData, callback){
			pool.query(getUserLeaguesQueryString, [userData['UserID']], function(error, results){
				if(error)return callback(error);
				return callback(null, results)
			})
		}
	}
}

function joinLeague(pool, leagueIdData, userData, callback){
	pool.query('SELECT LeagueTeamOwner FROM LeagueTeams WHERE LeagueID=?', [leagueIdData['leagueId']], function(error, results, fields){
		if(error)return callback(error);
		if(results.find(obj => {return obj.LeagueTeamOwner == userData.UserID}) != undefined)
			return callback(null, false)
		pool.query('INSERT INTO LeagueTeams(LeagueTeamOwner, LeagueID) VALUES (?)', [[userData['UserID'], leagueIdData['leagueId']]], function(error, results, fields){
			if(error)return callback(error);
			return callback(null, true)
		})
	})
}


getUserLeaguesQueryString = `
SELECT * FROM
( Select Leagues.*, Series.SeriesName From Leagues Join Series on Leagues.SeriesID = Series.SeriesID) as LeaguesInfo 
JOIN
(SELECT * FROM LeagueTeams WHERE LeagueTeamOwner = ?)as filteredLeagueTeams
on LeaguesInfo.LeagueID = filteredLeagueTeams.LeagueID;
`