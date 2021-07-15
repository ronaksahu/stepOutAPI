const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TimeSlotsSchema = new Schema({
    priceId: String,
    timeSlots: [{
        _id : false,
        date: Date,
        slots: [{
            _id : false,
            from: String,
            to: String
        }]
    }]
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
}, { _id : false });

module.exports = mongoose.model('TimeSlots', TimeSlotsSchema);