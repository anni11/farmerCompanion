
const mongoose 	= require('mongoose'),
	  demand   	= require('./models/demand').demandModel,
	  user  	= require('./models/user'),
	  faker 	= require('faker'),
	  item 		= require('./models/item');


var api = require("gettyimages-api");
var creds = { 	
	apiKey: "df9ds232st94fsqpr5u66zfu", 
	apiSecret: "DRmXZWe9XMargvbMV9enm5svYVA6PZxPVbrttmQxvDaGR", 
	username: "anni11", 
	password: "aaaa1234" 
};
var client = new api (creds);

// console.log(client.search().images().withPage(1).withPageSize(1).withPhrase('egg'));

function imageSearch (arg) {
	client.search().images().withPage(1).withPageSize(1)
	.withPhrase('eggs')
	.execute(function(err, response) {
	    if (err) 
	    	throw err

	    var ret = JSON.stringify(response.images[0].display_sizes[0].uri);
	    // console.log(typeof(ret));
	    return ret;
	});
}



const MAX = 5;

let contacts = [];
for (var i = 0; i < MAX; i++) {
	contacts.push(faker.phone.phoneNumber());
}

function createPost(){
	let newdemands=[];
	for (var i = 0; i < MAX; i++) {
		let newdemand = {
			title: faker.lorem.words(),
			body: faker.lorem.paragraph(),
			amount: Number(faker.finance.amount()),
			phone: contacts[i]
		}
		newdemands.push(newdemand);
	}
	demand.remove({}, function (err) {
		if(err){
			console.log(err);
		}
		else{
			console.log('removed');
			newdemands.forEach(function (seed) {
				demand.create(seed, function (err, created) {
					if(err){
						console.log(err);
					}
					else{
						console.log('created');
					}
				});
			});
		}
	});
	
}

const MAXITEMS = 5;
function createItem(){
	let newitems=[];
	for (var i = 0; i < MAXITEMS; i++) {
		let d = String(faker.commerce.productAdjective() + ' ' + faker.commerce.color() + ' ' + faker.commerce.product());
		let n = faker.commerce.productName();
		let img = imageSearch(n);
		let newitem = {
			name: n,
			description: d,
			quantity: Number(faker.random.number()),
			unit: faker.lorem.word(),
			price: Number(faker.finance.amount()),
			seller: contacts[i],
			url: "https://media.gettyimages.com/photos/young-girllaptop-picture-id91199117?b=1&k=6&m=91199117&s=170x170&h=v6NC5nB8VHNukT0bY7Xk0hmzvA5BiFcDlYQ2BAI8G74="
		}
		console.log(newitem);
		newitems.push(newitem);
	}
	item.remove({}, function (err) {
		if(err){
			console.log(err);
		}
		else{
			console.log('removedITEMS');
			newitems.forEach(function (seed) {
				item.create(seed, function (err, created) {
					if(err){
						console.log(err);
					}
					else{
						console.log('createdItems');
					}
				});
			});
		}
	});
}

const MAXUSERS = 5;
function createUser(){
	let newUsers=[];
	for (var i = 0; i < MAXUSERS; i++) {
		let ph = faker.phone.phoneNumber();
		let newUser = {
			username: contacts[i],
			name: faker.name.findName(),
			phone: contacts[i],
			town: faker.address.city(),
			state: faker.address.state(),
			password: faker.lorem.word()
		}
		newUsers.push(newUser);
	}
	user.remove({}, function (err) {
		if(err){
			console.log(err);
		}
		else{
			console.log('removeduserS');
			newUsers.forEach(function (seed) {
				user.create(seed, function (err, created) {
					if(err){
						console.log(err);
					}
					else{
						console.log('createdUsers');
					}
				});
			});
		}
	});
}


module.exports = {
	createPost: createPost,
	createItem: createItem,
	createUser: createUser,
	imageSearch: imageSearch
}