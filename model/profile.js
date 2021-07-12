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
    DOB: String,
    contactNo: {
        type: Number
    },
    profileImage: {
        data: Buffer,
        contentType: String
    },
    deviceToken: {
        type: String
    }
})

module.exports = mongoose.model('Profile', profileSchema)