function initChatDisplay(){
	var connectedUsersContainer = document.getElementById("connectedUsersContainer");
	var connectedUsersDisplay = document.getElementById("connectedUsersDisplay");
	var connectedUsers = auctionData.usersJoined;
	if(connectedUsersDisplay)
		connectedUsersDisplay.parentElement.removeChild(connectedUsersDisplay)
	connectedUsersDisplay = document.createElement("div");
	connectedUsersDisplay.setAttribute("id", "connectedUsersDisplay");
	connectedUsersDisplay.classList.add("connectedUsersDisplay");

	var tableHeader = document.createElement("div");
	tableHeader.classList.add("connectedUsersHeader");
	tableHeader.innerText = "Connected Users";
	connectedUsersDisplay.appendChild(tableHeader);
	connectedUsers.forEach(function(user){
		var userRow = document.createElement("div");
		userRow.classList.add("connectedUserRow");
		userRow.setAttribute("userId", user.UserID);
		userRow.innerText = user.FirstName + " " + user.LastName;
		connectedUsersDisplay.appendChild(userRow);
	})

	connectedUsersContainer.appendChild(connectedUsersDisplay);
}

function initAuctionDisplay(){
	var auctionArea = document.getElementById("auctionArea");
	if(auctionArea)auctionArea.parentElement.removeChild(auctionArea);
	auctionArea = document.createElement("div");
	auctionArea.setAttribute("id", "auctionArea");
	var auctionRoomContainer = document.getElementById("auctionRoomContainer");
	auctionRoomContainer.insertBefore(auctionArea, auctionRoomContainer.firstChild);
	var auctionStateDisplay = document.createElement("span");
	auctionStateDisplay.setAttribute("id", "auctionStateDisplay");
	auctionStateDisplay.innerText = auctionStatusDisplayString();
	auctionArea.appendChild(auctionStateDisplay);
	// if(auctionData.isUserLeagueAdmin){
	// 	auctionArea.appendChild(displayLeagueAdminAuctionControls());
	// }
	var playerAuctionInfoAndOptions = document.createElement("div");
	playerAuctionInfoAndOptions.setAttribute("id", "playerAuctionInfoAndOptions");
	auctionArea.appendChild(playerAuctionInfoAndOptions);
	displayPlayerAuctionInfoAndOptions();
}

function displayLeagueAdminAuctionControls(){
	var leagueAdminAuctionControls = document.getElementById("leagueAdminAuctionControls");
	if(leagueAdminAuctionControls)
		while(leagueAdminAuctionControls.firstChild){leagueAdminAuctionControls.removeChild(leagueAdminAuctionControls.lastChild);}
	if(!leagueAdminAuctionControls){
		leagueAdminAuctionControls = document.createElement("div");
		leagueAdminAuctionControls.setAttribute("id", "leagueAdminAuctionControls");
	}
	var toggleAuctionStateBtn = document.createElement("button");
	toggleAuctionStateBtn.setAttribute("id", "toggleAuctionBtn");
	toggleAuctionStateBtn.innerText = toggleAuctionStateButtonText();
	toggleAuctionStateBtn.addEventListener("click", function(e){toggleAuctionState()});
	leagueAdminAuctionControls.appendChild(toggleAuctionStateBtn);
	if(!auctionData.auctionLive)return leagueAdminAuctionControls;
	setUsedPlayers();
	leagueAdminAuctionControls.appendChild(setPlayersForAuctionList());
	var startPlayerAuctionBtn = document.createElement("button");
	startPlayerAuctionBtn.setAttribute("id", "startPlayerAuction");
	startPlayerAuctionBtn.addEventListener('click', function(e){startPlayerAuction()});
	startPlayerAuctionBtn.innerText = "Start Player Auction"
	leagueAdminAuctionControls.appendChild(startPlayerAuctionBtn);
	$(document).ready(function(){$('#selectAuctionPlayer').select2();});
	return leagueAdminAuctionControls;
}

function setPlayersForAuctionList(){
	var playerSelectList = document.createElement("select");
	playerSelectList.setAttribute("id", "selectAuctionPlayer");
	var seriesSquads = auctionData.seriesSquads;
	var playersUsed = auctionData.playersUsed;
	for(var key in seriesSquads){
		if(playersUsed.has(parseInt(key)))continue;
		var currPlayer = seriesSquads[key];
		var currPlayerOption = document.createElement("option");
		currPlayerOption.setAttribute("value", currPlayer['PlayerID']);
		currPlayerOption.innerText = currPlayer['PlayerName'];
		playerSelectList.add(currPlayerOption);
	}
	return playerSelectList;
}

function setUsedPlayers(){
	var leagueSquads = auctionData.leagueSquads;
	var playersUsed = new Set();
	for(var key in leagueSquads){
		leagueSquads[key]['Squad'].forEach(function(player){
			playersUsed.add(player['PlayerID']);
		});
	}
	auctionData['playersUsed'] = playersUsed
}

function newUserConnect(user){
	var connectedUsersDisplay = document.getElementById("connectedUsersDisplay");
	var userInJoinedUsers = auctionData.usersJoined.filter(item => (item['UserID'] == user.UserID))
	if(userInJoinedUsers.length>0)return;
	var userRow = document.createElement("div");
	userRow.setAttribute("userId", user.UserID);
	userRow.classList.add("connectedUserRow");
	userRow.innerText = user.FirstName + " " + user.LastName;
	connectedUsersDisplay.appendChild(userRow); 
}

function userDisconnect(user){
	var userId = user.UserID;
	var connectedUsersDisplay = document.getElementById("connectedUsersDisplay");
	var connectedUsers = connectedUsersDisplay.childNodes;
	connectedUsers.forEach(function(currUser){
		var currUserId = currUser.getAttribute("userId")
		if(currUserId==userId)
			currUser.parentElement.removeChild(currUser);
	});
	var usersJoined = auctionData.usersJoined
	for(var i=0; i<usersJoined.length; i++){
		if(usersJoined){
			usersJoined.splice(i, 1);
			break;
		}
	}
}

function toggleAuctionState(){
	socket.emit("setAuctionState", {"requestedState": !auctionData.auctionLive}, function(error, result){
		if(error)return alert(error);
		auctionData.auctionLive = result.auctionLive;
		if(!auctionData.auctionLive){
			auctionData.currPlayerOnAuction = null;
			auctionData.currPlayerMaxBid = null;
			auctionData.currWinningBid = null;
		}
		auctionStateUpdateDisplay();
		displayLeagueAdminAuctionControls();
		displayPlayerAuctionInfoAndOptions();
	});
}

function toggleAuctionStateButtonText(){
	if(auctionData.auctionLive)return "Pause Auction";
	return "Start/Resume Auction";
}

function startPlayerAuction(){
	if(!auctionData.auctionLive) return alert("Please start/resume the auction to start bidding for a player");
	if(auctionData.currPlayerOnAuction!=null)return alert("Please wait for current player auction to complete");
	var selectedPlayer = document.getElementById("selectAuctionPlayer");
	var selectedPlayerId = selectedPlayer.options[selectedPlayer.selectedIndex].value
	console.log(selectedPlayerId);
	socket.emit("startPlayerAuction", {"playerId": selectedPlayerId}, function(error, result){
		displayPayerAuctionRequestResult(error, result);
		if(error)return;
		auctionData.currPlayerOnAuction = result['playerId'];
		auctionData.currPlayerMaxBid = 0;
		displayPlayerAuctionInfoAndOptions();
	});
}

function displayPlayerAuctionInfoAndOptions(){
	var auctionArea = document.getElementById("auctionArea");
	var playerAuctionInfoAndOptions = document.getElementById("playerAuctionInfoAndOptions");
	while(playerAuctionInfoAndOptions.firstChild){playerAuctionInfoAndOptions.removeChild(playerAuctionInfoAndOptions.lastChild);}
	if(auctionData.isUserLeagueAdmin){
		auctionArea.appendChild(displayLeagueAdminAuctionControls());
	}
	// console.log(playerAuctionInfoAndOptions);
	if(!auctionData.auctionLive){
		// // while(playerAuctionInfoAndOptions.firstChild){playerAuctionInfoAndOptions.removeChild(playerAuctionInfoAndOptions.lastChild);}
		// playerAuctionInfoAndOptions.innerText = "Waiting for league admin to start auction";
		return;
	}
	else if(auctionData.currPlayerOnAuction==null){
		// while(playerAuctionInfoAndOptions.firstChild){playerAuctionInfoAndOptions.removeChild(playerAuctionInfoAndOptions.lastChild);}
		if(!auctionData.isUserLeagueAdmin)playerAuctionInfoAndOptions.innerText = "Waiting for league admin to select player to be auctioned";
	}
	else {
		playerAuctionInfoAndOptions.appendChild(setPlayerOnAuctionInfo());
		playerAuctionInfoAndOptions.appendChild(setPlayerBidOptions());
	}
}

function setPlayerOnAuctionInfo(){
	var playerOnAuctionInfo = auctionData.seriesSquads[auctionData.currPlayerOnAuction];
	var playerOnAuctionInfoDisplay = document.createElement("div");
	playerOnAuctionInfoDisplay.setAttribute("id", "playerOnAuctionInfoDisplay");
	var playerName = document.createElement("span");
	var playerType = document.createElement("span");
	var playerTeam = document.createElement("img");
	playerName.classList.add("col-sm-6", "playerOnAuctionName");
	playerType.classList.add("col-sm-2", "playerOnAuctionType");
	playerTeam.classList.add("col-sm-4", "playerOnAuctionTeam");
	playerName.innerText = playerOnAuctionInfo['PlayerName'];
	playerType.innerText = playerOnAuctionInfo['PlayerType'];
	playerTeam.setAttribute("src", playerOnAuctionInfo["TeamLogoURL"]);
	playerOnAuctionInfoDisplay.appendChild(playerName);
	playerOnAuctionInfoDisplay.appendChild(playerType);
	playerOnAuctionInfoDisplay.appendChild(playerTeam);
	return playerOnAuctionInfoDisplay;
}

function setPlayerBidOptions(){
	var submitBidButton = document.createElement("button");
	submitBidButton.setAttribute("id", "submitBidButton");
	submitBidButton.innerText = "Bid" + (auctionData.currPlayerMaxBid+100);
	submitBidButton.addEventListener("click", submitBidHandler)
	setAllowBid();
	return submitBidButton
}

function setAllowBid(){
	var submitBidButton = document.getElementById("submitBidButton");
	// if(auctionData.currPlayerMaxBid+100 > 199)submitBidButton.disabled = true;
}

function submitBidHandler(){
	var submitBidButton = document.getElementById("submitBidButton");
	// submitBidButton.disabled = true;
	socket.emit("playerBid", {"playerId": auctionData.currPlayerOnAuction, "bidAmount": auctionData.currPlayerMaxBid+100}, function(error, result){
		if(error)return console.log(error);
		newMaxBidUpdateDataAndDisplay(result);
	});
}

function newMaxBidUpdateDataAndDisplay(bidData){
	auctionData.currPlayerMaxBid = bidData.newMaxBidAmount;
	submitBidButton.innerText = "Bid" + (auctionData.currPlayerMaxBid+100);
	console.log("new max bid from " + bidData.maxBidUser.FirstName + " for amount " + auctionData.currPlayerMaxBid);
}

function displayPayerAuctionRequestResult(error, result){
	if(error)console.log;
	else console.log(result);
}

function displayLeagueSquads(){
	var leagueSquadsContainer = document.getElementById("leagueSquadsContainer");
	while(leagueSquadsContainer.firstChild){leagueSquadsContainer.removeChild(leagueSquadsContainer.lastChild);}
	var leagueSquads = auctionData.leagueSquads;
	for(var key in leagueSquads){
		displayUserSquad(key, leagueSquads[key].Squad);
	}
}

function displayUserSquad(userId, userSquad){
	console.log("Printing user Squad");
	console.log(userSquad);
	var leagueSquadsContainer = document.getElementById("leagueSquadsContainer");
	var userSquadDiv = document.createElement("span");
	userSquadDiv.setAttribute("id", "UserSquad_"+userId);
	userSquadDiv.classList.add("userSquad", "col-sm-5");
	if(userSquad.length==0){
		userSquadDiv.innerText = "No players purchased yet";
		leagueSquadsContainer.appendChild(userSquadDiv)
		return;
	}
	userSquad.forEach(function(player){
		userSquadDiv.appendChild(createPlayerRow(player));
	})
	leagueSquadsContainer.appendChild(userSquadDiv)
}

function createPlayerRow(player){
	var playerRow = document.createElement("div");
	playerRow.classList.add("playerRow");
	var playerName = document.createElement("span");
	var playerType = document.createElement("span");
	var playerTeam = document.createElement("img");
	playerName.classList.add("col-sm-6", "playerName");
	playerType.classList.add("col-sm-2", "playerType");
	playerTeam.classList.add("col-sm-4", "playerTeam");
	playerName.innerText = player['PlayerName'];
	playerType.innerText = player['PlayerType'];
	playerTeam.setAttribute("src", player["TeamLogoURL"]);
	playerRow.appendChild(playerName);
	playerRow.appendChild(playerType);
	playerRow.appendChild(playerTeam);
	return playerRow;
}

function playerSoldUpdateDisplay(saleData){
	var userSquadDiv = document.getElementById("UserSquad_"+saleData['LeagueTeamOwner']);
	userSquadDiv.appendChild(createPlayerRow(saleData));
}

function auctionStatusDisplayString(){
	if(auctionData.auctionLive)return "Auction is Live";
	var leagueSquads = auctionData.leagueSquads;
	var playersDrafted = 0;
	for(var key in leagueSquads)playersDrafted+=leagueSquads[key]['Squad'].length;
	if(playersDrafted>0)return "Auction is paused";
	return "Auction has not started yet"
}

function auctionStateUpdateDisplay(){
	console.log(auctionData);
	var auctionStateDisplay = document.getElementById("auctionStateDisplay")
	auctionStateDisplay.innerText = auctionStatusDisplayString();
}

function addNewUserMessage(messageData){
	chatMessages = document.getElementById("chatMessages");
	chatMessages.appendChild(createUserMessageRow(messageData));
}

function showSentMessage(message){
	chatMessages = document.getElementById("chatMessages");
	chatMessages.appendChild(createSelfMessageRow(message));
}

function createUserMessageRow(messageData){
	var messageRow = document.createElement("div");
	messageRow.classList.add("userMessageRow");
	var userName = messageData.user['FirstName'] + " " + messageData.user['LastName'];
	var userNameRow = document.createElement("div");
	userNameRow.classList.add("messageUserName")
	userNameRow.innerText = userName;
	var messageText = messageData["message"];
	var messageTextRow = document.createElement("div");
	messageTextRow.innerText = messageText;
	messageRow.appendChild(userNameRow);
	messageRow.appendChild(messageTextRow);
	return messageRow;
}

function createSelfMessageRow(message){
	var messageRow = document.createElement("div");
	messageRow.classList.add("selfMessageRow");
	var userName = "You";
	var userNameRow = document.createElement("div");
	userNameRow.classList.add("messageUserName")
	userNameRow.innerText = userName;
	var messageText = message;
	var messageTextRow = document.createElement("div");
	messageTextRow.innerText = message;
	messageRow.appendChild(userNameRow);
	messageRow.appendChild(messageTextRow);
	return messageRow;
}