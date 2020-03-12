module.exports = function(app, passport){
	app.get('/', function(req, res){
		res.render('index.ejs')
	})

	app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

	app.get('/googleLoginSuccess', 
	  passport.authenticate('google', {successRedirect: '/home', failureRedirect: '/unauthorizedUser' })
	);

	app.get('/home', isLoggedIn, function(req, res){
		res.send('Welcome to BidUp')
	})

	app.get('/unauthorizedUser', function(req, res){
		res.send('unauthorizedUser')
	})
}

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}