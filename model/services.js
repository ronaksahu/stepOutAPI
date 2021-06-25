const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = mongoose.Schema({
    address: String,
    street: String,
    city: String
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
    price: {
        type: Number,
        required: true
    },
    addressDetail: AddressSchema,
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