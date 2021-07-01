const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: String,
    lastName: String,
    DOB: Date,
    contactNo: {
        type: Number
    }
})

module.exports = mongoose.model('Profile', profileSchema)