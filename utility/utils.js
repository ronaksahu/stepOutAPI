const jwt = require('jsonwebtoken');
const config = require('../config.json')
const otpGenerator = require("otp-generator");
const crypto       = require("crypto");

const utils = {

    authenticateToken: function(req, res, next) {
        
        const authHeader = req.headers['authorization'];

        const token = authHeader && authHeader.split(' ')[1];

        if(token == null) return res.sendStatus(401);
        jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) res.sendStatus(403);
            req.user = user;
            next();

        })
    },
    isVendor: function(req, res, next) {

        const user = req.user
        if(user.userType != 'vendor') res.sendStatus(401)
        next();
    },
    isUser: function(req, res, next) {

        const user = req.user
        if(user.userType != 'user') res.sendStatus(401)
        next();
    },
    generateAccessToken: function(user) {
        return jwt.sign(user, config.JWT_ACCESS_TOKEN_SECRET);
    },
    distance: function(lat1, lon1, lat2, lon2, unit) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit=="K") { dist = dist * 1.609344 }
            if (unit=="N") { dist = dist * 0.8684 }
            return dist;
        }
    },
    generateOTP: function(phoneNo) {
        const otp      = otpGenerator.generate(6, {alphabets: false, upperCase: false, specialChars: false});
        console.log(otp)
        const ttl      = 60 * 1000; //5 Minutes in miliseconds
        const expires  = Date.now() + ttl; //timestamp to 5 minutes in the future
        const data     = `${phoneNo}.${otp}.${expires}`; // phone.otp.expiry_timestamp
        const hash     = crypto.createHmac("sha256", config.otpKey).update(data).digest("hex"); // creating SHA256 hash of the data
        const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user
        // you have to implement the function to send SMS yourself. For demo purpose. let's assume it's called sendSMS
        //sendSMS(phone,`Your OTP is ${otp}. it will expire in 5 minutes`);
        return fullHash;
    },
    verifyOtp : function(phone, hash, otp) {
          // Seperate Hash value and expires from the hash returned from the user
        let [hashValue,expires] = hash.split(".");
        // Check if expiry time has passed
        let now = Date.now();
        if(now>parseInt(expires)) return false;
        // Calculate new hash with the same key and the same algorithm
        let data  = `${phone}.${otp}.${expires}`;
        let newCalculatedHash = crypto.createHmac("sha256",config.otpKey).update(data).digest("hex");
        // Match the hashes
        if(newCalculatedHash === hashValue){
            return true;
        } 
        return false;
    }

}

module.exports = utils;