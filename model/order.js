const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
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
    quantity: {
        type: Number
    },
    transactionStatus: {
        type: String
    },
    orderStatus: {
        type: String
    },
    orderId: {
        type: Number
    },
    transactionId: Number,
    totalPrice: Number,
    
})


module.exports = mongoose.model('Order', OrderSchema)