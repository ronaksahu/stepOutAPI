const express = require('express')
var router = express.Router()

var userAuth = require('./userAuth');
var vendorAuth = require('./vendorAuth');
var auth = require('./auth')
var utils = require('../utility/utils')

router.use('/auth', auth);

router.use(utils.authenticateToken)

router.use('/vendor', utils.isVendor, vendorAuth);

router.use('/user', utils.isUser, userAuth);



module.exports = router;