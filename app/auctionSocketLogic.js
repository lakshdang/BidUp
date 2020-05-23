var util = require('util');

module.exports = function(io, pool){
	const auctionRoomNsp = io.of('/auctionRoom');
	var leagueLogic = require('./leagueLogic')(pool);
	var auctionLogic = require('./auctionLogic')(pool);
	var auctionRooms = require('./auctionRooms')(pool);

	auctionRoomNsp.on("connection", function(socket){
		socket.appVars = {};
		var appVars = socket.appVars;
		appVars.isUserLeagueAdmin = false;
		appVars.leagueId = null;
		appVars.user = socket.request.user;

		socket.on("joinOrOpenAuctionRoom", function(data, callback){
			appVars.leagueId = data['leagueId'];
			var auctionRoomPromise = auctionRooms.joinOrOpenAuctionRoom(appVars.leagueId, appVars.user)
			auctionRoomPromise.then(function(result){
				// console.log(result);
				callback(result);
			}).catch(function(error){
				// console.log(error);
				callback(error);
			})
		})
	})
}

// module.exports = function(io, passport, pool){
// 	const auctionRoom = io.of('/auctionRoom');
// 	leagueLogic = require('./leagueLogic')(pool);
// 	auctionLogic = require('./auctionLogic')(pool);
	
// 	auctionRoom.on("connection", function(socket){
// 		socket.appVars = {};
// 		var appVars = socket.appVars;
// 		appVars.isUserLeagueAdmin = false;
// 		appVars.isAuctionOpen = false;
// 		appVars.leagueId = null;
// 		appVars.user = socket.request.user;

// 		socket.on("joinOrStartAuction", function(data, callback){
// 			appVars.leagueId = data['leagueId'];
// 			var auctionPromise = auctionLogic.startOrJoinLeagueAuctionPromise(appVars.leagueId, appVars.user);
// 			var leagueInfoPromise = leagueLogic.getLeagueInfoPromise(appVars.leagueId);
// 			var leagueSquadsPromise = leagueLogic.getLeagueSqaudsAndPlayersPromise(appVars.leagueId);
// 			var joinRoomPromise = joinRoom()
// 			auctionPromise.catch(function(error){
// 				callback({"error": error.message});
// 				socket.disconnect();
// 			})
// 			promises = [auctionPromise, leagueInfoPromise, leagueSquadsPromise, joinRoomPromise];
// 			Promise.all(promises).then(function(values){
// 				printMemUsage();
// 				var userName = appVars.user.FirstName + " " + appVars.user.LastName
// 				appVars.isAuctionOpen = values[0]["auctionOpen"];
// 				appVars.isUserLeagueAdmin = values[1][0]['LeagueAdminUserID'] == socket.request.user['UserID'];
// 				if(appVars.isUserLeagueAdmin){
// 					auctionRoom.in(appVars.leagueId).clients(function(error, clients){
// 						if(error)return callback({"error": "Backend Error"});
// 						clients.forEach(function(client){
// 							auctionRoom.sockets[client].appVars.isAuctionOpen = true;
// 						})
// 						socket.broadcast.to(appVars.leagueId).emit('leagueAdminJoined', values[3]['usersInRoom'][0]);
// 					})
// 				}
// 				else
// 					socket.broadcast.to(appVars.leagueId).emit('userJoined', values[3]['usersInRoom'][0]);
// 				printMemUsage();
// 				return callback(Object.assign(values[0], values[3], values[2]));
// 			})
// 		});

// 		socket.on("testEvent", function(data){
// 			console.log(appVars.isAuctionOpen);
// 		})

// 		socket.on("disconnect", function(reason){
// 			if(reason == "server namespace disconnect")return auctionRoom.to(appVars.leagueId).emit('user disconnect', {"userId": appVars.UserID, "name": appVars.user.FirstName + " " + appVars.user.LastName})
// 			if(appVars.isUserLeagueAdmin){
// 				pauseAcutionPromise = auctionLogic.pauseLeagueAuctionPromise(appVars.leagueId, appVars.user.UserID);
// 				pauseAcutionPromise.catch(function(error){
// 					console.log(error);
// 				})
// 				auctionRoom.in(appVars.leagueId).clients(function(error, clients){
// 					if(error)console.log(error);
// 					else {
// 						clients.forEach(function(client){
// 							auctionRoom.sockets[client].appVars.isAuctionOpen = false;
// 						});
// 					}
// 				});
// 				auctionRoom.to(appVars.leagueId).emit('adminDisconnect', {"userId": appVars.user.UserID});
// 			}
// 			else 
// 				auctionRoom.to(appVars.leagueId).emit('userDisconnect', {"userId": appVars.user.UserID});
// 		})

// 		socket.on("sendUserMessage", function(data){
// 			socket.broadcast.to(appVars.leagueId).emit('newUserMessage', {"message": data.message, "userId": appVars.user.UserID, "userName": appVars.user.FirstName+" "+appVars.user.LastName});
// 			console.log(data);
// 		})

// 		function joinRoom(){
// 			return new Promise(function(resolve, reject){
// 				var usersInRoom = [{"userId": appVars.user.UserID, "name": socket.request.user.FirstName + " " + socket.request.user.LastName, "isAdmin": appVars.isUserLeagueAdmin}];
// 				auctionRoom.in(appVars.leagueId).clients(function(error, clients){
// 					if(error)return reject({"error": "Backend Error"});
// 					clients.forEach(function(client){
// 						var currUser = auctionRoom.sockets[client].request.user;
// 						if(currUser.UserID==socket.request.user.UserID){
// 							auctionRoom.sockets[client].emit("newLogin", {"message": "New Login to auction room detected"});
// 							auctionRoom.sockets[client].disconnect();
// 						}
// 						else usersInRoom.push({"userId": currUser['UserID'], "name": currUser['FirstName'] + " " + currUser['LastName'], "isAdmin": appVars.isUserLeagueAdmin});
// 					})
// 					socket.join(appVars.leagueId);
// 					return resolve({"usersInRoom": usersInRoom});
// 				})
// 			})
// 		}

// 		function printMemUsage(){
// 			const memUsed = process.memoryUsage();
// 			console.log("Curr mem usage");
// 			for (let key in memUsed){
// 				console.log(`${key} ${Math.round(memUsed[key] / 1024 / 1024 * 100) / 100} MB`);
// 			}
// 		}
// 	});
// }