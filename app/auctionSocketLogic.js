var util = require('util');
var events = require('events');
var em = new events.EventEmitter();

module.exports = function(io, pool){
	const auctionRoomNsp = io.of('/auctionRoom');
	var leagueLogic = require('./leagueLogic')(pool);
	var auctionLogic = require('./auctionLogic')(pool);
	var auctionRooms = require('./auctionRooms')(pool, em);

	em.on("playerBought", function eventHandler(data){
		console.log(data);
		// auctionRoomNsp.sockets.in(data.leagueId).emit('playerSold', data);
		auctionRoomNsp.to(data.leagueId).emit('playerSold', data);
	})

	auctionRoomNsp.on("connection", function(socket){
		socket.appVars = {};
		var appVars = socket.appVars;
		appVars.isUserLeagueAdmin = false;
		appVars.leagueId = null;
		appVars.user = socket.request.user;

		socket.on("joinOrOpenAuctionRoom", function(data, callback){
			appVars.leagueId = data['leagueId'];
			var joinOrOpenAuctionRoomPromise = auctionRooms.joinOrOpenAuctionRoom(appVars.leagueId, appVars.user)
			joinOrOpenAuctionRoomPromise.then(function(result){
				removeDuplicateUserSocket().catch(function(error){
					console.log(error);
					callback(error);
					socket.disconnect();
				}).then(function(isDuplicateUser){
					socket.join(appVars.leagueId);
					if(result.leagueAdminId==appVars.user.UserID){
						appVars.isUserLeagueAdmin = true;
						result['isUserLeagueAdmin'] = true;
					}
					else
						result['isUserAdmin'] = false;

					if(!isDuplicateUser)socket.broadcast.to(appVars.leagueId).emit('userJoined', appVars.user);
					callback(result);
				});
			}).catch(function(error){
				callback(error);
				socket.disconnect();
			})			
		})

		socket.on("sendUserMessage", function(data){
			socket.broadcast.to(appVars.leagueId).emit('newUserMessage', {"message": data.message, "user": appVars.user});
			console.log(data);
		})

		socket.on("disconnect", function(reason){
			if(reason=="server namespace disconnect")return;
			var leaveAuctionPromise = auctionRooms.leaveAuction(appVars.leagueId, appVars.user);
		 	leaveAuctionPromise.then(function(result){
		 		socket.broadcast.to(appVars.leagueId).emit('userDisconnect', appVars.user);
		 		socket.broadcast.to(appVars.leagueId).emit('auctionStatusUpdate', result);
		 	}).catch(function(error){
		 		console.log("Invalid user disconnect request");
		 		console.log(error);
		 	})
		});

		socket.on("setAuctionState", function(data, callback){
			if(!appVars.isUserLeagueAdmin)return callback(new Error("Only league admin can stop or start the auction"));
			var updateAuctionStatePromise = auctionRooms.updateAuctionState(appVars.leagueId, data.requestedState, appVars.user);
			updateAuctionStatePromise.then(function(result){
				socket.broadcast.to(appVars.leagueId).emit('auctionStatusUpdate', result);
				console.log(result);
				callback(null, result)
			}).catch(function(error){
				console.log(error);
				callback(error);
			})
		})

		socket.on("startPlayerAuction", function(data, callback){
			startPlayerAuctionPromise = auctionRooms.startPlayerAuction(appVars.leagueId, data.playerId, appVars.user);
			startPlayerAuctionPromise.then(function(result){
				socket.broadcast.to(appVars.leagueId).emit('newPlayerAuction', result);
				callback(null, result);
			}).catch(function(error){
				console.log(error)
				callback(error);
			})
		})

		socket.on("playerBid", function(data, callback){
			var bidData = Object.assign(data, {user: appVars.user});
			console.log(bidData);
			var playerBidPromise = auctionRooms.submitPlayerBid(appVars.leagueId, bidData, appVars.user);
			playerBidPromise.then(function(result){
				socket.broadcast.to(appVars.leagueId).emit("newMaxPlayerBid", result);
				return callback(null, result);
			}).catch(function(error){
				return callback(error, null)
			})
		})

		function removeDuplicateUserSocket(){
			return new Promise(function(resolve, reject){
				auctionRoomNsp.in(appVars.leagueId).clients(function(error, clients){
					var isDuplicateUser = false;
					if(error)return reject(error);
					clients.forEach(function(client){
						var currUser = auctionRoomNsp.sockets[client].request.user;
						if(currUser.UserID==appVars.user.UserID){
							isDuplicateUser = true;
							auctionRoomNsp.sockets[client].emit("multipleLogins", {"message": "A New Login to auction room detected"});
							auctionRoomNsp.sockets[client].disconnect();
						}
					})
					return resolve(isDuplicateUser);
				})
			})
		}
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