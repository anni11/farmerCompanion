const mongoose = require('mongoose');

const demandSchema = new mongoose.Schema({
	title: String,
	body: String,
	amount: Number,
	phone: String
});


module.exports = {
	demandSchema : demandSchema,
	demandModel  : mongoose.model('demand', demandSchema)
}
