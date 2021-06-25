const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
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
    rating: {
        type: Number
    },
    review: {
        type: String
    }
})

module.exports = mongoose.model('Reviews', ReviewSchema);