const jwt = require('jsonwebtoken');
const config = require('../config.json')

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
    }

}

module.exports = utils;