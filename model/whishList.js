const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WhishListSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: [{
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required: true
    }]
});

module.exports = mongoose.model('whishList', WhishListSchema)