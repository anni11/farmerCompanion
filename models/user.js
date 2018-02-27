const mongoose = require('mongoose'),
	  demand = require('./demand'),
	  passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	username: String,
	name: String,
	phone: String,
	town: String,
	state: String,
	password: String

});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema);
