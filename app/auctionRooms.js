var util = require('util');
// var events = require('events');
// var em = new events.EventEmitter();
var em;
var auctionLogic;
var leagueLogic;
var seriesLogic;

var leagueHashMap = {};
var seriesSquadsMap = {};
module.exports = function(pool, eventEmitter){
	auctionLogic = require('./auctionLogic')(pool);
	leagueLogic = require('./leagueLogic')(pool);
	seriesLogic = require('./seriesLogic')(pool);
	em = eventEmitter;
	return{
		joinOrOpenAuctionRoom: function(leagueId, user){
			return new Promise(function(resolve, reject){
				if(leagueHashMap.hasOwnProperty(leagueId)){
					if(leagueHashMap[leagueId]!=null){
						var currAuctionRoom = leagueHashMap[leagueId];
						currAuctionRoom.userJoined(user);
						currAuctionRoom.getAuctionPageDisplayDataPromise().then(function(result){
							return resolve(result)
						}).catch(function(error){
							return reject(new Error("Backend Error"))
						});
					}
					else{
						em.on("AuctionRoomSetUpComplete", function eventHandler(data){
							if(data['leagueId']==leagueId){
								em.removeListener("AuctionRoomSetUpComplete", eventHandler);
								if(data['success']){
									var currAuctionRoom = leagueHashMap[leagueId];
									currAuctionRoom.userJoined(user);
									currAuctionRoom.getAuctionPageDisplayDataPromise().then(function(result){
										return resolve(result)
									}).catch(function(error){
										return reject(new Error("Backend Error"))
									});
								}
								else
									return reject(new Error("Backend Error"));
							}
						})
					}
				}
				else{
					console.log("creating auction room for league: " + leagueId);
					leagueHashMap[leagueId] = null;
					var leagueInfoPromise = leagueLogic.getLeagueInfoPromise(leagueId);
					var userLeagueTeamsPromise = leagueLogic.getUserLeagueTeamsPromise(leagueId);
					var leagueSquadsPromise = leagueLogic.getLeagueSquadsPromise(leagueId);
					// var leagueTeamsPromise = leagueLogic.getLeagueTeamsPromise(leagueId);
					var promises = [leagueInfoPromise, userLeagueTeamsPromise, leagueSquadsPromise];
					Promise.all(promises).then(function(values){
						// console.log(values)
						if(values[0].length==0) reject(new Error("Invalid League"));
						var userTeam = values[1].filter(function(leagueTeam){return leagueTeam['LeagueTeamOwner']==user['UserID']});
						if(userTeam.length==0) reject(new Error("You are not a member of this league"));
						var currAuctionRoom = new AuctionRoom(values[0][0], user, values[1], values[2]);
						leagueHashMap[leagueId] = currAuctionRoom;
						// console.log(currAuctionRoom)
						em.emit("AuctionRoomSetUpComplete", {"leagueId": leagueId, "success": true});
						currAuctionRoom.getAuctionPageDisplayDataPromise().then(function(result){
							// console.log(result);
							return resolve(result)
						}).catch(function(error){
							return reject(new Error("Backend Error"));
						});
					}).catch(function(error){
						console.log(error);
						delete leagueHashMap[leagueId];
						em.emit("AuctionRoomSetUpComplete", {"leagueId": leagueId, "success": false});
						return reject(new Error("Backend Error"));
					})
				}
			})
		},

		leaveAuction: function(leagueId, user){
			return new Promise(function(resolve, reject){
				if(!leagueHashMap.hasOwnProperty(leagueId))
					return reject();
				if(leagueHashMap[leagueId]==null){
					em.on("AuctionRoomSetUpComplete", function eventHandler(data){
						if(data['leagueId']==leagueId){
							em.removeListener("AuctionRoomSetUpComplete", eventHandler);
							if(data['success']){
								var currAuctionRoom = leagueHashMap[leagueId];
								var userLeaveData = currAuctionRoom.userLeft(user);
								if(userLeaveData['auctionRoomClosed'])delete leagueHashMap[leagueId];
								if(!userLeaveData['userLeft'])return reject(userLeaveData)
								return resolve(userLeaveData);
							}
							else return reject("Backend Error");
						}
					})
				}
				else{
					var currAuctionRoom = leagueHashMap[leagueId];
					var userLeaveData = currAuctionRoom.userLeft(user);
					if(userLeaveData['auctionRoomClosed'])delete leagueHashMap[leagueId];
					if(!userLeaveData['userLeft'])return reject(userLeaveData)
					return resolve(userLeaveData);
				}
			})
		},

		updateAuctionState: function(leagueId, requstedAuctionLiveStatus, user){
			return new Promise(function(resolve, reject){
				if(!leagueHashMap.hasOwnProperty(leagueId) || leagueHashMap[leagueId]==null){
					// console.log("Update Auction Live status, auction not found");
					return reject(new Error("Invalid Request"));
				}
				var currAuctionRoom = leagueHashMap[leagueId];
				var updateAuctionStatusResult = currAuctionRoom.updateAuctionLiveStatus(requstedAuctionLiveStatus, user);
				if(updateAuctionStatusResult)return reject(updateAuctionStatusResult);
				return resolve({"auctionLive": requstedAuctionLiveStatus});
			})
		},

		startPlayerAuction: function(leagueId, playerId, user){
			return new Promise(function(resolve, reject){
				if(!leagueHashMap.hasOwnProperty(leagueId) || leagueHashMap[leagueId]==null)reject("Invalid League");
				var currAuctionRoom = leagueHashMap[leagueId];
				var playerAuctionPromise = currAuctionRoom.startPlayerAuction(playerId, user);
				playerAuctionPromise.then(function(result){resolve(result)}).catch(function(error){reject(error)});

			})
		},

		submitPlayerBid: function(leagueId, bidData, user){
			return new Promise(function(resolve, reject){
				if(!leagueHashMap.hasOwnProperty(leagueId) || leagueHashMap[leagueId]==null)reject("Invalid League");
				var currAuctionRoom = leagueHashMap[leagueId];
				var playerBidPromise = currAuctionRoom.submitPlayerBid(bidData.playerId, bidData.bidAmount, bidData.user);
				playerBidPromise.then(function(result){return resolve(result)}).catch(function(error){return reject(error)});
			})
		}
	}
}

function getSeriesSquad(seriesId){
	return new Promise(function(resolve, reject){
		if(seriesSquadsMap.hasOwnProperty(seriesId)){
			if(seriesSquadsMap[seriesId]!=null)return resolve(seriesSquadsMap[seriesId]);
			em.on("SeriesSquadsSet", function eventHandler(data){
				if(data['seriesId']==seriesId){
					em.removeListener("SeriesSquadsSet", eventHandler);
					if(data['success'])
						return resolve(seriesSquadsMap[seriesId]);
					else
						return reject(new Error("Backend Error"));
				}
			})
		}
		else{
			seriesSquadsMap[seriesId] = null;
			var seriesSquadPromise = seriesLogic.getSeriesSquadsPromise(seriesId);
			seriesSquadPromise.then(function(result){
				seriesSquadsMap[seriesId] = setSeriesSquadObject(result);
				em.emit("SeriesSquadsSet", {"seriesId": seriesId, "success": true})
				return resolve(seriesSquadsMap[seriesId]);
			}).catch(function(error){
				delete seriesSquadsMap[seriesId];
				em.emit("SeriesSquadsSet", {"seriesId": seriesId, "success": false})
				return reject(new Error("Backend Error"));
			})
		}
	})
}

function setSeriesSquadObject(seriesSquads){
	var ret = {};
	seriesSquads.forEach(function(player){
		ret[player['PlayerID']] = player;
	})
	return ret;
}

function setLeagueSquads(leagueSquads, leagueTeams){
	console.log(leagueTeams);
	console.log(leagueSquads);
	var ret = {};
	var teamToUserMap = {};
	leagueTeams.forEach(function(team){
		teamToUserMap[team['LeagueTeamID']] = team['LeagueTeamOwner']
		var temp = {};
		temp['LeagueTeamID'] = team['LeagueTeamID'];
		temp['Squad'] = []
		ret[team['LeagueTeamOwner']] = temp;
	})
	leagueSquads.forEach(function(player){
		// console.log(player);
		ret[teamToUserMap[player['LeagueTeamID']]]['Squad'].push(player)
	})
	// console.log(util.inspect(ret, false, null, true /* enable colors */));
	return ret;
}

function setUsedPlayers(leagueSquads){
	var ret = new Set();
	leagueSquads.forEach(function(player){
		ret.add(player['PlayerID']);
	})
	// console.log(ret);
	return ret;
}

class AuctionRoom{
	constructor(leagueInfo, openUser, leagueTeams, leagueSquads){
		this.leagueSquads = setLeagueSquads(leagueSquads, leagueTeams);
		this.usedPlayers = setUsedPlayers(leagueSquads);
		this.leagueTeams  = leagueTeams;
		this.leagueInfo = leagueInfo;
		this.adminId = leagueInfo['LeagueAdminUserID'];
		this.usersJoined = [openUser];
		this.auctionLive = false;
		this.currPlayerOnAuction = null;
		this.currPlayerMaxBid = null;
		this.bidTime = 10000;
		this.currWinningBid = null;
	}

	userJoined(user){
		for(var i=0; i<this.usersJoined.length; i++){
			if(this.usersJoined[i]['UserID']==user['UserID']){
				this.usersJoined.splice(i, 1);
				break;
			}
		}
		this.usersJoined.push(user);
		// console.log(this.usersJoined);
	}

	userLeft(user){
		var ret = {"userLeft": false, "auctionLive": this.auctionLive, "auctionRoomClosed": false};
		var i=0;
		while(i<this.usersJoined.length){
			if(this.usersJoined[i]['UserID']==user['UserID'])break;
			i++;
		}
		if(i==this.usersJoined.length)return ret;

		this.usersJoined.splice(i, 1);
		ret['userLeft'] = true;

		if(user.UserID==this.adminId){
			ret['auctionLive'] = false;
			this.auctionLive = false;
		}
		
		if(this.usersJoined.length==0)ret["AuctionRoomClosed"] = true;
		// console.log(this.usersJoined)
		return ret;	
	}

	updateAuctionLiveStatus(newAuctionLiveStatus, user){
		if(user.UserID!=this.adminId)return new Error("Only league admin can stop/start the auction");
		// if(typeof requestedStatus !="")
		this.auctionLive = newAuctionLiveStatus;
		if(!this.auctionLive){
			this.currPlayerOnAuction = null;
			this.currPlayerMaxBid = null;
			this.currWinningBid = null;
		}
		return null; 
	}

	startPlayerAuction(playerId, user){
		var currAuction = this;
		return new Promise(function(resolve, reject){
			playerId = parseInt(playerId);
			if(user.UserID!=currAuction.adminId)return reject(new Error("Only league admin can start a players auction"));
			if(currAuction.currPlayerOnAuction!=null)return reject(new Error("Please wait for current player auction to be completed"));
			var getSeriesSquadPromise = getSeriesSquad(currAuction.leagueInfo['SeriesID']);
			getSeriesSquadPromise.then(function(seriesSquad){
				if(!seriesSquad.hasOwnProperty(playerId))return reject(new Error("Player is not a part of this series"));
				if(currAuction.usedPlayers.has(playerId))return reject(new Error("Player has already been drafted"));
				currAuction.currPlayerOnAuction = playerId;
				currAuction.currPlayerMaxBid = 0;
				return resolve({"playerId": playerId});
			}).catch(function(error){return reject("Backend error")});
		})
	}

	getAuctionPageDisplayDataPromise(){
		var currAuction = this;
		return new Promise(function(resolve, reject){
			var getSeriesSquadPromise = getSeriesSquad(currAuction.leagueInfo['SeriesID']);
			getSeriesSquadPromise.then(function(result){
				var ret = {
					"seriesSquads": result,
					"leagueSquads": currAuction.leagueSquads,
					"leagueTeams": currAuction.leagueTeams,
					"leagueAdminId": currAuction.adminId,
					"usersJoined": currAuction.usersJoined,
					"auctionLive": currAuction.auctionLive,
					"currPlayerOnAuction": currAuction.currPlayerOnAuction,
					"currPlayerMaxBid": currAuction.currPlayerMaxBid,
					"bidTime": currAuction.bidTime,
					"currWinningBid": currAuction.currWinningBid
				}
				// console.log(util.inspect(ret, false, null, true /* enable colors */));
				return resolve(ret);
			}).catch(function(error){
				console.log(error);
				return reject(new Error("Backend Error"));
			})
		})
	}

	submitPlayerBid(playerId, bidAmount, user){
		var currAuction = this;
		return new Promise(function(resolve, reject){
			if(!currAuction.auctionLive)return reject(new Error("The auction is currently paused/not started"))
			if(playerId != currAuction.currPlayerOnAuction)return reject(new Error("This is not the player currently on auction"));
			if(bidAmount<currAuction.currPlayerMaxBid+100)return reject("The bid amount is less than the minumum required amount");
			if(bidAmount>1000)return reject(new Error("Insufficient funds"));
			currAuction.currPlayerMaxBid = bidAmount;
			if(currAuction.currWinningBid!=null)clearTimeout(currAuction.currWinningBid)
			currAuction.currWinningBid = setTimeout(function(){
				var retObj = {
					"leagueId": currAuction.leagueInfo.LeagueID, 
					"playerId": currAuction.currPlayerOnAuction,
					"winningUser": user.UserID,
					"bidAmount": bidAmount
				}
				var leagueTeamId = currAuction.leagueSquads[user.UserID].LeagueTeamID;
				var recordPlayerPurchasePromise = leagueLogic.recordPlayerPurchasePromise(leagueTeamId, playerId, bidAmount);
				recordPlayerPurchasePromise.then(function(result){
					currAuction.currPlayerOnAuction = null;
					currAuction.currPlayerMaxBid = null;
					currAuction.currWinningBid = null;
					em.emit("playerBought", retObj)
				}).catch(function(error){console.log(error)});
			}, currAuction.bidTime);
			return resolve({"newMaxBidAmount": bidAmount, "maxBidUser": user});
		})
	}
}