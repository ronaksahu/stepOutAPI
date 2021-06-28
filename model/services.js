const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = mongoose.Schema({
    address: String,
    street: String,
    city: String
})

const timeSlotsSchema = mongoose.Schema({
    date: Date,
    timeSlots: [{
        from: String,
        to: String
    }, { _id : false }]
} , { _id : false })

const priceSchema = mongoose.Schema({
    category: {type: String},
    prices: [{
        title: String,
        amount: Number
    }]
})

const ServiceSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    image: {
        type: String,
        trim: true
    }, 
    activity_type: [{
        type: String
    }],
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    prices: [priceSchema],
    addressDetail: AddressSchema,
    timeBased: {type: Boolean},
    timeSlots: [timeSlotsSchema],
    status: {
        type: String,
        required: true,
        default: 'Active',
        enum: ['Active', 'Inactive']
    }

}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});


module.exports = mongoose.model('Services', ServiceSchema);