var util = require('util')

module.exports = function(app, passport, pool){
	userLogic = require('./userLogic')(pool);
	seriesLogic = require('./seriesLogic')(pool);
	leagueLogic= require('./leagueLogic')(pool);

	app.get('/', function(req, res){
		if(req.isAuthenticated())return res.redirect('/home');
		res.render('index.ejs')
	})

	app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

	app.get('/googleLoginSuccess', 
	  passport.authenticate('google', {successRedirect: '/home', failureRedirect: '/unauthorizedUser'})
	);

	app.get('/home', isLoggedIn, function(req, res){
		res.render('home.ejs', {user: req.user})
	})

	app.get('/unauthorizedUser', function(req, res){
		res.render('unauthorizedUser.ejs', {user: req.user})
	})

	app.get('/addUser', isAdmin, function(req, res){
		var flashMessage = (req.flash('flashMessage')[0]);
		res.render('addUser.ejs', {user: req.user, message: flashMessage})
	})

	app.post('/addUser', isAdmin, function(req, res){
		userLogic.addUser(req.body, function(error, userAdded){
			if(error)throw error;
			if(!userAdded)req.flash('flashMessage', 'User Already Exists');
			else req.flash('flashMessage', 'User Added');
			res.redirect('/addUser')
		})
	})

	app.get('/createLeague', isLoggedIn, function(req, res){
		var flashMessage = (req.flash('flashMessage')[0]);
		seriesLogic.getPlayableSeries(function(error, results){
			if(error)throw error;
			res.render('./createLeague.ejs', {user: req.user, message: flashMessage, series: results})
		})			
	})

	app.post('/createLeague', isLoggedIn, function(req, res){
		leagueLogic.createLeague(req.body, req.user, function(error, result){
			if(error)return res.send(error);
			req.flash('flashMessage', 'League created!')
			res.redirect('/createLeague')
		})
	})

	app.get('/addPlayableSeries', isAdmin, function(req, res){
		var flashMessage = (req.flash('flashMessage')[0]);
		seriesLogic.getUnplayableSeries(function(error, results){
			if(error)res.send(error);
			res.render('addPlayableSeries.ejs', {user: req.user, message: flashMessage, series: results})
		})
	})

	app.post('/joinLeague', isLoggedIn, function(req, res){
		leagueLogic.joinLeague(req.body, req.user, function(error, result){
			if(error)res.send(error);
			if(!result)req.flash('flashMessage', 'Cannot Join League');
			else req.flash('flashMessage', 'League Joined');
			res.redirect('/createLeague')
		})	
	})

	app.post('/addPlayableSeries', isAdmin, function(req, res){
		seriesLogic.addPlayableSeries(req.body.Series, function(error, result){
			if(error)req.flash('flashMessage', 'Error Adding Series');
			else req.flash('flashMessage', 'Series added to playable list')
			res.redirect('/addPlayableSeries')
		})
	})

	app.get('/userLeagues', isLoggedIn, function(req, res){
		var flashMessage = (req.flash('flashMessage')[0]);
		leagueLogic.getUserLeagues(req.user, function(error, results){
			if(error)return res.send(error);
			return res.render('userLeagues.ejs', {user: req.user, message: flashMessage, userLeagues: results})
		})
	})

	app.get('/leaguePage', isLoggedIn, function(req, res){
		var leagueId = req.query.leagueId;
		legueInfoPromise = leagueLogic.getLeagueInfoPromise(leagueId);
		leagueTeamsPromise = leagueLogic.getLeagueTeamsPromise(leagueId);
		promises = [legueInfoPromise, leagueTeamsPromise];
		Promise.all(promises).then(function(values){
			res.render('leaguePage.ejs', {user: req.user, leagueInfo: values[0][0], leagueTeams: values[1]});
		})
	})

	app.get('/auctionRoom', isLoggedIn, function(req, res){
		var leagueId = req.query.leagueId;
		res.render('auctionRoom.ejs', {user: req.user});
	})
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated())return next();
	res.redirect('/');
}

function isAdmin(req, res, next){
	if(req.isAuthenticated() && req.user.Admin==1)return next();
	else if(req.isAuthenticated())res.redirect('/unauthorizedUser');
	else res.redirect('/');
}