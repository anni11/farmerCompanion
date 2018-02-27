const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
	name: String,
	description: String,
	quantity: Number,
	unit: String,
	price: Number,
	seller: String,
	url: String
});

module.exports = mongoose.model('item', itemSchema);
