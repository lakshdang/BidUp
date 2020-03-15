module.exports = function(app, passport, pool){
	userLogic = require('./userLogic')(pool)

	app.get('/', function(req, res){
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
		flashMessage = (req.flash('flashMessage')[0]);
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
		res.send('Add League Page')
	})
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated())return next();
	res.redirect('/');
}

function isAdmin(req, res, next){
	if(req.isAuthenticated() && req.user.Admin==1)return next();
	else if(req.isAuthenticated())res.redirect('/unauthorizedUser');
	else res.redirect('/')
}