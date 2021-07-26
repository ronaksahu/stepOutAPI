const jwt = require('jsonwebtoken');
const config = require('../config.json')
const otpGenerator = require("otp-generator");
const crypto       = require("crypto");
const Vendor = require('../model/vendor');
const User = require('../model/user');
const moment= require('moment') 

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
    validateVendor: async function(req, res, next) {
        const vendor = req.user
        const vendorExist = await Vendor.exists({email: vendor.email});
        if(!vendorExist) res.sendStatus(403)
        next();
    },
    validateUser: async function(req, res, next) {
        const user = req.user
        const userExist = await User.exists({email: user.email});
        if(!userExist) res.sendStatus(403)
        next();
    },
    generateAccessToken: function(user) {
        return jwt.sign(user, config.JWT_ACCESS_TOKEN_SECRET);
    },
    distance: function(userLocation, serviceLocation, unit) {
        const lat1 = userLocation.lat;
        const lon1 = userLocation.lng;
        const lat2 = serviceLocation.lat;
        const lon2 = serviceLocation.lng

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
    },
    getMinPriceService: function(priceObj) {
        var minPrice = 99999;
        priceObj.prices.forEach(price => {
            price.prices.forEach(item => {
                if(minPrice > item.amount) {
                    minPrice = item.amount;
                }
            })
        });
        return minPrice;
    },
    getMaxPriceService: function(priceObj) {
        var maxPrice = 0;
        priceObj.prices.forEach(price => {
            price.prices.forEach(item => {
                if(maxPrice < item.amount) {
                    maxPrice = item.amount;
                }
            })
        });
        return maxPrice;
    },
    getDatesBetweenRange: function(dateRange, days) {
        var start = dateRange.from,
            end = dateRange.to;
        var daysMap = {sun:1,mon:2,tue:3,wed:4,thu:5,fri:6,sat:7,all:8};
        var dayList = []
        if(days.indexOf('all') > -1 ) {
            return utils.getDates(start, end)
        } else {
            var result = []
            days.forEach(day => {
                var dayNo = daysMap[day.toLowerCase()]
                result.push(...utils.getDatesOfDays(start, end, dayNo))
            })
            return result;
        }    
    },
    getDates: function(startDate, stopDate) {
        var dateArray = [];
        startDate = startDate.split('/')
        stopDate = stopDate.split('/')
        currentDate = moment(new Date(Number(startDate[2]), Number(startDate[1])-1, Number(startDate[0])));
        stopDate = moment(new Date(Number(stopDate[2]), Number(stopDate[1])-1, Number(stopDate[0])));
        while (currentDate <= stopDate) {
            dateArray.push( moment(currentDate))
            currentDate = moment(currentDate).add(1, 'days');
        }
        return dateArray;
    },
    getDatesOfDays: function(startDate, stopDate, day) {
        startDate = startDate.split('/')
        stopDate = stopDate.split('/')
        var start = moment(new Date(Number(startDate[2]), Number(startDate[1])-1, Number(startDate[0]))), // Sept. 1st
            end   = moment(new Date(Number(stopDate[2]), Number(stopDate[1])-1, Number(stopDate[0]))) // Nov. 2nd
        var result = []
        var current = new Date(start);
        // Shift to next of required days
        current.setDate(current.getDate() + (day - current.getDay() + 7) % 7);
        // While less than end date, add dates to result array
        while (current < end) {
            result.push(new Date(+current));
            current.setDate(current.getDate() + 7);
        }
        return result;
    },
    getDeviceID: function(userList) {
        var deviceIds = []
        userList.forEach(user => {
            deviceIds.push(user.userDetail.deviceToken)
        })
        return deviceIds;
    }

}

module.exports = utils;