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
    category: {
        type: Schema.Types.ObjectId
    },
    price: {
        type: Schema.Types.ObjectId
    },
    quantity: {
        type: Number
    }
});

module.exports = mongoose.model('Cart', CartSchema)