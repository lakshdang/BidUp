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
					if(error)returnk
					return joinLeague(pool, {"leagueId": results[1][0]['LeagueID']}, leagueAdminData, callback)
				})
			})
		},

		getUserLeagues: function(userData, callback){
			pool.query(getUserLeaguesQueryString, [userData['UserID']], function(error, results){
				if(error)return callback(error);
				return callback(null, results)
			})
		},

		getLeagueInfo: function(leagueId, callback){
			getLeagueInfo(leagueId, pool, callback);
		},

		getLeagueInfoPromise : function(leagueId){
			return new Promise(function(resolve, reject){
				pool.query(getLeagueInfoQueryString, [leagueId], function(error, results){
					if(error)return reject(error);
					resolve(results);
				})
			})
		},

		getLeagueTeamsPromise: function(leagueId){
			return new Promise(function(resolve, reject){
				pool.query(getLeagueTeamsQueryString, [leagueId], function(error, results){
					if(error)return reject(error);
					resolve(results);
				})
			})
		},

		getUserLeagueTeamPromise(leagueId, userId){
			return new Promise(function(resolve, reject){
				pool.query(getUserLeagueTeamQueryString, [leagueId, userId], function(error, results){
					if(error)return reject(error);
					else return resolve(results);
				})
			})
		},

		startOrResumeTeamAuctionPromise(leagueId){
			return new Promise(function(resolve, reject){
				pool.query(startOrResumeTeamAuctionQueryString, [leagueId], function(error, results){
					if(error)return reject(error);
					return resolve(results);
				})
			})
		},

		pauseLeagueAuctionPromise(leagueId){
			return new Promise(function(resolve, reject){
				pool.query(pauseLeagueAuctionQueryString, [leagueId], function(error, results){
					if(error)return reject(error);
					return resolve(results);
				})
			})
		},

		getLeagueSquadsPromise(leagueId){
			return new Promise(function(resolve, reject){
				pool.query(getLeagueSquadsQueryString, [leagueId], function(error, results){
					if(error)return reject(error);
					return resolve(results);
				})
			})
		},

		getLeagueSqaudsAndPlayersPromise: function(leagueId){
			return new Promise(function(resolve, reject){
				pool.query(getLeagueSqaudsAndPlayersQueryString, [leagueId, leagueId], function(error, results){
					if(error)return reject(new Error("Backend Error"));
					return resolve({"leagueSquadsAndPlayers": results});
				})
			})
		},

		getUserLeagueTeamsPromise: function(leagueId){
			return new Promise(function(resolve, reject){
				pool.query(getUserLeagueTeamsPromiseQueryString, [leagueId], function(error, results){
					if(error){
						console.log(error);
						return reject(new Error("Backend Error"));
					}
					return resolve(results);
				})
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
};

function getLeagueInfo(leagueId, pool, callback){
	pool.query(getLeagueInfoQueryString, [leagueId], function(error, results){
		if(error)return callback(error, null);
		return callback(null, results);
	})
};


var getUserLeaguesQueryString = `
SELECT * FROM
( Select Leagues.*, Series.SeriesName From Leagues Join Series on Leagues.SeriesID = Series.SeriesID) as LeaguesInfo 
JOIN
(SELECT * FROM LeagueTeams WHERE LeagueTeamOwner = ?)as filteredLeagueTeams
on LeaguesInfo.LeagueID = filteredLeagueTeams.LeagueID;
`;

var getLeagueInfoQueryString =`
SELECT * FROM 
Leagues Join Users
On Leagues.LeagueAdminUserID = Users.UserID
Where Leagues.LeagueID = ?;
`;

var getLeagueTeamsQueryString =`
SELECT * FROM 
LeagueTeams Join Users
On LeagueTeams.LeagueTeamOwner = Users.UserID
Where LeagueTeams.LeagueID = ?;
`;

var getUserLeagueTeamQueryString = `
SELECT * FROM LeagueTeams Where LeagueID = ? AND LeagueTeamOwner = ?;
`;

startOrResumeTeamAuctionQueryString = `
UPDATE Leagues SET LeagueTeamsSet = 2 WHERE LeagueID = ?;
`;

var getLeagueSquadsQueryString = `
Select * From LeagueTeams Where LeagueID = ?;
`;

var pauseLeagueAuctionQueryString = `
UPDATE Leagues SET LeagueTeamsSet = 1 WHERE LeagueID = ?;
`;

var getLeagueSqaudsAndPlayersQueryString = `
SELECT * FROM AuctionLeagueTeamPlayerData WHERE LeagueID=? OR SeriesID=(Select SeriesID FROM Leagues WHERE Leagues.LeagueID=?);
`;

var getUserLeagueTeamsPromiseQueryString = `
SELECT * FROM LeagueTeams WHERE LeagueID = ?;
`;