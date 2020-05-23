function initChatDisplay(){
	var connectedUsersContainer = document.getElementById("connectedUsersContainer");
	var connectedUsersDisplay = document.getElementById("connectedUsersDisplay");
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
		userRow.setAttribute("userId", user.userId);
		userRow.innerText = user.name;
		connectedUsersDisplay.appendChild(userRow);
	})

	connectedUsersContainer.appendChild(connectedUsersDisplay);
}

function newUserConnect(user){
	var connectedUsersDisplay = document.getElementById("connectedUsersDisplay");
	var userRow = document.createElement("div");
	userRow.setAttribute("userId", user.userId);
	userRow.classList.add("connectedUserRow");
	userRow.innerText = user.name;
	connectedUsersDisplay.appendChild(userRow); 
}

function userDisconnect(user){
	var userId = user.userId;
	var connectedUsersDisplay = document.getElementById("connectedUsersDisplay");
	var connectedUsers = connectedUsersDisplay.childNodes;
	connectedUsers.forEach(function(currUser){
		var currUserId = currUser.getAttribute("userId")
		if(currUserId==userId)
			currUser.parentElement.removeChild(currUser);
	});
}

function displayLeagueSqauds(){
	var leagueSquadsContainer = document.getElementById("leagueSquadsContainer");
	var numPlayers = leagueSquadsAndPlayers.length;
	var i=0;
	while(i<numPlayers){
		// console.log(i);
		if(leagueSquadsAndPlayers[i]['LeagueTeamID']==null)return i;
		var currTeamID = leagueSquadsAndPlayers[i]['LeagueTeamID'];
		var currSquad = [];
		while(i<numPlayers && leagueSquadsAndPlayers[i]['LeagueTeamID']==currTeamID){
			currSquad.push(leagueSquadsAndPlayers[i]);
			i++;
		}
		displayUserSquad(currSquad);
	}
}

function displayUserSquad(userSquad){
	console.log(userSquad[0]);
	console.log(userSquad[0]['PlayerID']==null)
	var leagueSquadsContainer = document.getElementById("leagueSquadsContainer");
	var userSquadDiv = document.createElement("span");
	userSquadDiv.classList.add("userSquad", "col-sm-5");
	if(userSquad[0]['PlayerID']==null){
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
	playerType.innerText = getPlayerPosShortForm(player['PlayerType']);
	playerTeam.setAttribute("src", player["TeamLogoURL"]);
	playerRow.appendChild(playerName);
	playerRow.appendChild(playerType);
	playerRow.appendChild(playerTeam);
	return playerRow;
}

function getPlayerPosShortForm(playerType){
	if(playerType=="WicketKeeper")return "Wick";
	if(playerType=="Batter")return "Bat";
	if(playerType=="Bowler")return "Bowl";
	return "All";
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
	var userName = messageData['userName'];
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