const   express 		= require('express'),
		app 			= express(),
		mongoose 		= require('mongoose'),
		passport		= require('passport'),
		LocalStrategy	= require('passport-local'),
		bodyParser 		= require('body-parser'),
		demand  		= require('./models/demand').demandModel,
		user			= require('./models/user'),
		item 			= require('./models/item'),
		seed			= require('./seed'),
		PORT 			= process.env.PORT || 8000,
		path 			= require('path');

// mongoose.connect('mongodb://localhost/demandDb');
mongoose.connect('mongodb://anni:abcd1234@ds143532.mlab.com:43532/farmerdb');
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))).set('views', path.join(__dirname, 'views'));

/*
// run the below code to reset the database else keep on commented
seed.createUser();
seed.createPost();
seed.createItem();
*/


// setup ends

// PASSPORT CONFIG
app.use(require("express-session")({
	secret: 'abcd',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
//


app.use(function (req, res, next) {
	res.locals.currUser = req.user;
	next();
});

app.listen(PORT, function () {
	console.log(`Listening on ${PORT}`);
});


app.get('/', function (req, res) {
	res.render('index');
});


//users page


app.get('/about', (req, res) => res.render('about'));

app.get('/contact', (req, res) => res.render('contact'));

app.get('/user/:id', function (req, res) {
	user.findById(req.params.id, function (err, founduser) {
		if(err){
			console.log('error in retrieving users');
			res.render('errorPage', {reason:"user doesn't exist"});
		}
		else{
			//user found now find the dmeands
			demand.find({phone:founduser.phone}, function (err, demands) {
				if(err){
					console.log('error in user/id: cant retrieve demands');
					res.render('errorPage', {reason:'demands cant be fetched'});
				}
				else{
					//demands fetched now fetch item
					item.find({seller:founduser.phone}, function (err, items) {
						if(err){
							console.log('error: cant retrieve items from db');
							res.render('error', {reason:'cant fetch user items'});
						}
						else{
							res.render('userDetail', {user:founduser, demands:demands, items:items});
						}
					});
				}
			});
		}
	})
});

app.get('/user', function (req, res) {
	user.find({}, function (err, founduser) {
		if(err){
			console.log('error in retrieving users');
			res.render('errorPage', {reason:"can't retrieve users from db"});
		}
		else{
			res.render('user', {users:founduser});
		}
	})
});

app.post('/user/:id', isLoggedIn,function (req, res) {
	user.findByIdAndUpdate(req.params.id, req.body.user, function (err) {
		if(err){
			console.log('error: in updating');
			res.render('errorPage', {reason:'cant update'});
		}
		else{
			res.redirect('/user/'+req.params.id);
		}
	});
});

app.get('/user/:id/edit', isLoggedIn,function (req, res) {
	user.findById(req.params.id, function (err, user) {
		if(err){
			console.log("error:can't find the user");
			res.render('errorPage', {reason:'cant find user'});
		}
		else{
			res.render('editUser', {user:user});
		}
	});
});

// items/commodities
app.get('/item/new', isLoggedIn, function (req, res) {
	res.render('newItem');
});

app.get('/item', function (req, res) {
	item.find({}, function (err, items) {
		if(err){
			console.log('ERROR: items not populated');
			res.render('errorPage', {reason:"unable to access db"})
		}
		else{
			res.render('item',{items:items});
		}
	})
});

app.get('/item/:id', function (req, res) {
	//item detail
	item.findById(req.params.id, function (err, item) {
		if(err){
			console.log('ERROR: cannot retrieve item');
			res.render('errorPage', {reason:"unable to locate item in db"});
		}
		else{
			// console.log(item);
			user.findOne({phone:item.seller}, function (err, user) {
				if(err){
					console.log('error:in finding user related to an item');
					res.render('errorPage', {reason:'cant link user to the item'});
				}
				res.render('itemDetail', {item:item, user:user});
			});
		}

	});
});
app.get('/item/:id/buy', isLoggedIn,function (req, res) {
	item.findByIdAndRemove(req.params.id, function (err) {
		if(err){
			console.log('ERROR: unable to buy');
			res.render('errorPage', {reason:"unable to buy item"});
		}
		else{
			res.send('buying page coming soon!!');
		}
	})
});
app.get('/item/:id/update', isLoggedIn, function (req, res) {
	item.findById(req.params.id, function (err, item) {
		if(err){
			console.log('ERROR: cannot find item');
			res.render('errorPage', {reason:"can't retrieve item from db"});
		}
		else{
			res.render('editItem', {item:item});
		}
	});
});

app.post('/item/:id', isLoggedIn, function (req, res) {
	//edited
	// req.body.item.url = seed.imageSearch(req.body.item.name);
	req.body.item.url = "https://media.gettyimages.com/photos/young-girllaptop-picture-id91199117?b=1&k=6&m=91199117&s=170x170&h=v6NC5nB8VHNukT0bY7Xk0hmzvA5BiFcDlYQ2BAI8G74=";
	item.findByIdAndUpdate(req.params.id, req.body.item, function (err, updated) {
		if(err){
			console.log('ERROR: error in updating');
			res.render('errorPage', {reason:"unable to update item detail"});
		}
		else{
			res.redirect('/item/'+req.params.id);
		}
	})
});
app.post('/item/:id/delete', isLoggedIn, function (req, res) {
	item.findByIdAndRemove(req.params.id, function (err) {
		if(err){
			console.log('ERROR: in deleting item');
			res.render('errorPage', {reason:"unable to delete item"});
		}
		else{
			res.redirect('/item');
		}
	})
});
app.post('/item', isLoggedIn, function (req, res) {
	let newItem = req.body.item;
	newItem.seller = req.user.phone;
	newItem.url = "https://media.gettyimages.com/photos/young-girllaptop-picture-id91199117?b=1&k=6&m=91199117&s=170x170&h=v6NC5nB8VHNukT0bY7Xk0hmzvA5BiFcDlYQ2BAI8G74=";
	item.create(newItem, function (err, itemcreated) {
		if(err){
			console.log('ERROR: failed to create new item');
			res.render('errorPage', {reason:"can't create new item"});
		}
		else{
			res.redirect('/item');
		}
	})
});




// demand

app.post('/demand', isLoggedIn,function (req, res) {
	let newDemand = req.body.demand;
	newDemand.phone = req.user.phone;
	demand.create(req.body.demand, function (err, createdDemand) {
		if(err){
			console.log('ERROR: in creating new demand!');
			res.render('errorPage', {reason:"unable to create new demand"});
		}
		else{
			console.log(createdDemand);
			res.redirect('/demand');
		}
	})
});


app.get('/demand', function (req, res) {
	// console.log(req.user);
	demand.find({}, function (err, demands) {
		res.render('demand', {demands:demands});
	});
});

app.get('/demand/new', isLoggedIn, function (req, res) {
	res.render('newDemand');
});

app.get('/demand/completed', function (req, res) {
	res.render('completed');
});

app.get('/demand/:id', function (req, res) {
	demand.findById(req.params.id, function (err, demand) {
		if(err){
			console.log('ERROR: in find demand detail');
			res.render('errorPage', {reason:"cannot find item"});
		}
		else{
			user.findOne({phone:demand.phone}, function (err, uuser) {
				if(err){
					console.log(err);
				}
				else{
					res.render('demandDetail', {demand:demand, uuser:uuser});
				}
			});
		}
	});
});

app.post('/demand/:id', isLoggedIn, function (req, res) {
	demand.findByIdAndUpdate(req.params.id, req.body.demand, function (err, demand) {
		if(err){
			console.log('couldn\'t update the demand post');
			res.render('errorPage', {reason:"unable to update post"});
		}
		else{
			res.redirect('/demand/'+req.params.id);
		}
	})
});

app.get('/demand/:id/update', function (req, res) {
	const id = req.params.id;
	demand.findById(id, function (err, demand) {
		if(err){
			res.render('errorPage',{reason:"item doesn't exist in db"});
		}
		else{
			res.render('updateDemand', {demand:demand});
		}
	})
});

app.post('/demand/:id/delete', isLoggedIn, function (req, res) {
	demand.findByIdAndRemove(req.params.id, function (err) {
		if(err){
			console.log('ERROR: in delete');
			res.render('errorPage', {reason:"database error"});
		}	
		else{
			res.redirect('/demand');
		}
	});
});

//auth



// AUTH ROUTES
app.get('/signup', function (req, res) {
	res.render('signup');
});

app.post('/signup', function (req, res) {
	// res.send('registered');
	var newUser = new user({
		username:req.body.user.phone,
		name:req.body.user.name,
		phone:req.body.user.phone,
		aadhar:req.body.user.aadhar,
		town:req.body.user.town,
		state:req.body.user.state
	});
	user.findOne({phone:newUser.phone}, function (err, founduser) {
		if(err){
			res.render('errorPage', {reason:"database error"});
		}
		else{
			if(founduser){
				console.log('ERROR: user exists');
				res.render('errorPage', {reason:"user exists"});
			}
			else{
				user.register(newUser, req.body.password, function (err, user) {
					if(err){
						console.log('ERROR: in signup');
						return res.render('errorPage', {reason:"unable to signup"});
					}
					console.log('CREATED!!!');
					res.redirect('/login');
					// passport.authenticate('local')(req, res, function () {
					// 	console.log('authenticated');
					// 	res.redirect('/demand');
					// });
				});
			}
		}
	});

});


app.get('/login', function (req, res) {
	res.render('login');
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/demand',
	failureRedirect: '/login'
}), function (req, res) {

});

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});



app.get('*', function (req, res) {
	res.render('errorPage', {reason:"no such link exists"});
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}
