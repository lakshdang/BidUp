module.exports = function(io, passport){
	io.on("connection", function(socket){
		var userId = socket.request.session.passport;
		console.log(userId);
		if(userId==undefined){
			socket.disconnect("Unauthorized");
			return;
		}
		userId = userId.user
		passport.deserializeUser(userId, function(error, result){
		})

		socket.on("testEvent", function(message, callback){
			console.log("Test event recieved from:", socket.request.session.passport.user)
			console.log(message);
		})
	})
}