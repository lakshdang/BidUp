module.exports = function(pool){
	var leagueLogic = require('./leagueLogic')(pool);
	return{
		pauseLeagueAuctionPromise: function(leagueId, userId){
			return new Promise(function(resolve, reject){
				var leagueInfoPromise = leagueLogic.getLeagueInfoPromise(leagueId);
				leagueInfoPromise.then(function(result){
					leagueInfo = result[0];
					if(leagueInfo.LeagueAdminUserID!=userId)return reject(new Error("Only League Admin can pause league Auction"));
					if(leagueInfo.LeagueTeamsSet!=2)return reject(new Error("Auction is not open"));
					var pauseLeagueAuctionPromise = leagueLogic.pauseLeagueAuctionPromise(leagueId);
					pauseLeagueAuctionPromise.then(function(result){resolve("Auction Paused")});
					pauseLeagueAuctionPromise.catch(function(error){console.log(error);reject("BackEnd Error")});
				}).catch(function(error){
					console.log(error)
					return reject(new Error("BackEnd Error"));
				});
			})
		},

		startOrJoinLeagueAuctionPromise: function(leagueId, user){
			return new Promise(function(resolve, reject){
				var leagueInfoPromise = leagueLogic.getLeagueInfoPromise(leagueId);
				var userLeagueTeamPromise = leagueLogic.getUserLeagueTeamPromise(leagueId, user['UserID']);
				promises = [leagueInfoPromise, userLeagueTeamPromise];
				Promise.all(promises).then(function(values){
					if(values[0].length==0)return reject(new Error("Invalid League"));
					if(values[1].length==0)return reject(new Error("Invalid User"));
					var leagueInfo = values[0][0];
					var leagueAuctionStatus = leagueInfo['LeagueTeamsSet'];
					var userId = user['UserID'];
					var leagueAdminId = leagueInfo['LeagueAdminUserID'];
					if(leagueAuctionStatus==0 || leagueAuctionStatus==1){
						if(userId==leagueAdminId){
							leagueLogic.startOrResumeTeamAuctionPromise(leagueId).then(function(results){
								return resolve({"auctionOpen": true});
							}).catch(function(error){
								return reject(new Error("BackEnd Error"))
							})
						}
						else return resolve({"auctionOpen": false, "reason": "Waiting for league admin to start/resume auction"});
					}
					else{
						if(leagueAuctionStatus==3)return resolve({"auctionOpen": false, "reason": "The auction for this league has already been completed"});
						return resolve({"auctionOpen": true});
					}
				}).catch(function(error){
					return reject(new Error("BackEnd Error"))
				});
			});
		}
	}
}