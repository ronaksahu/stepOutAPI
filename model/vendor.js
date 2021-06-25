const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        lowercase: true,
        trim: true
    },
    lastName: {
        type: String,
        lowercase: true,
        trim: true
    },
    contactNo: {
        type: Number,
        unique: true        
    },
    birthDate: {
        type: String,
    },
    password: {
        type: String,
        minlength: 7,
        required: true
    }, 
    address: {
        type: String,
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

UserSchema.pre('save', function(next) {

    const user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(4, function(err, salt) {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
    
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


module.exports = mongoose.model('Vendor', UserSchema);