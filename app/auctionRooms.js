var events = require('events');
var em = new events.EventEmitter();
module.exports = function(pool){
	var leagueHashMap = {};
	// var seriesPlayers = {};
	auctionLogic = require('./auctionLogic')(pool);
	leagueLogic = require('./leagueLogic')(pool);
	return{
		joinOrOpenAuctionRoom: function(leagueId, user){
			// console.log(user['FirstName'] + " requesting to join auction from for league" + leagueId);
			return new Promise(function(resolve, reject){
				if(leagueHashMap.hasOwnProperty(leagueId)){
					if(leagueHashMap[leagueId]!=null)return resolve({"AuctionRoomJoined": true});
					em.on("AuctionRoomSetUpComplete", function handler(data){
						console.log(data+" auctionRoom set up completed");
						resolve("Auction Joined");
					})
				}
				else{
					leagueHashMap[leagueId] = null;
					var leagueInfoPromise = leagueLogic.getLeagueInfoPromise(leagueId);
					var leagueSquadsPromise = leagueLogic.getLeagueSqaudsAndPlayersPromise(leagueId);
					var userLeagueTeamsPromise = leagueLogic.getUserLeagueTeamsPromise(leagueId)
					var promises = [leagueInfoPromise, leagueSquadsPromise, userLeagueTeamsPromise];
					Promise.all(promises).then(function(values){
						if(values[0].length==0)reject(new Error("Invalid League"));
						var userTeam = values[2].filter(function(leagueTeam){return leagueTeam['LeagueTeamOwner']==user['UserID']});
						if(userTeam.length==0)return reject(new Error("You are not a member of this league"));
						var currAuctionRoom = new AuctionRoom(values[0][0], user, values[2]);
						leagueHashMap[leagueId] = currAuctionRoom;
						em.emit("AuctionRoomSetUpComplete", leagueId);
						return resolve("Auction Joined")
					})
				}
			})
		}
	}
}

class AuctionRoom{
	constructor(leagueInfo, openUser, leagueTeams){
		this.leagueTeams  = leagueTeams;
		this.leagueId = leagueInfo['LeagueID'];
		this.adminId = leagueInfo['LeagueAdminUserID'];
		this.usersJoined = [openUser];
		this.auctionLive = false;
		this.currPlayerOnAuction = null;
		this.currPlayerMaxBid = null;
		this.bidTime = 10000;
		this.currWinningBid = null;
	}

	usersJoined(user){
		this.usersJoined.push(user);
	}

	userLeft(user){
		var ret = {"AuctionClosed": false, "AuctionRoomClosed": false};
		if(user.UserID==this.adminId){
			ret["AuctionClosed"] = true;
			this.auctionLive = false;
			if(this.currPlayerMaxBid!=null)clearTimout(this.currPlayerMaxBid);
		}
		for(var i=0; i<this.usersJoined.length; i++){
			if(this.usersJoined[i]['UserID']==user['UserID'])this.usersJoined.splice(i, 1);
		}
		if(this.usersJoined.length==0)ret["AuctionRoomClosed"] = true;
		return ret;
	}

	startAuction(user){
		var ret = {"AuctionLive": this.auctionLive}
		if(this.auctionLive)return ret;
		if(user['UserID']==this.adminId){
			this.auctionLive = true;
			ret["AuctionLive"] = true;
		}
		return ret;
	}

	pauseAuction(user){
		var ret = {"AuctionLive": this.auctionLive}
		if(!this.auctionLive)return ret;
		if(user['UserID']==this.adminId){
			this.auctionLive = false;
			ret["AuctionLive"] = false;
		}
		return ret;
	}
}