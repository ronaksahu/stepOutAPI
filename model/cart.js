const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required: true
    },
    category: String,
    timeSlot: {
        date: Date,
        from: String,
        to: String
    },
    priceType: String,
    amount: Number,
    quantity: {
        type: Number
    },
    totalAmount: Number
});

module.exports = mongoose.model('Cart', CartSchema)