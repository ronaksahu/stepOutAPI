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
    timeSlot: {
        date: Date,
        from: String,
        to: String
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
    price: Number
    
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})


module.exports = mongoose.model('Order', OrderSchema)