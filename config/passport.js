var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');

module.exports = function(passport, pool){

	passport.serializeUser(function(user, done){
		console.log(user)
		done(null, user.userId);
	});

	passport.deserializeUser(function(userId, done){
		pool.query('SELECT * FROM Users WHERE userID=?', [userId], function(error, results, fields){
			if(error)throw error
			if(results.length==0)return done(null, false);
			return done(null, results[0])
		})
	});

	passport.use(new GoogleStrategy({
	    clientID: configAuth.googleAuth.clientID,
	    clientSecret: configAuth.googleAuth.clientSecret,
	    callbackURL: configAuth.googleAuth.callbackURL
	  },
	  function(accessToken, refreshToken, profile, done){
	    	process.nextTick(function(){
	    		user = {"userId": null};
				email = profile['_json']['email']
				pool.query('SELECT * FROM Users WHERE email=?', [email], function(error, results, fields){
					if(error) return done(error);
					if(results.length==0)return done(null, false);
					userId = results[0]['UserID']
					user["userId"] = userId
					if(results[0]['Verified']==0){
						firstName = profile['_json']['given_name']
						lastName = profile['_json']['family_name']
						pool.query('UPDATE Users SET FirstName=?, LastName=?, Verified=? WHERE UserID=?', [firstName, lastName, true, userId], function(error, updateResults, fields){
							if(error) return done(error);
							return done(null, user)
						})
					}
					else
						return done(null, user)
				})
	    	});
	    })
	);
};