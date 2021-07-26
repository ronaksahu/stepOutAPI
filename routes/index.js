const express = require('express')
var router = express.Router()

var userAuth = require('./userAuth');
var vendorAuth = require('./vendorAuth');
var auth = require('./auth')
var utils = require('../utility/utils')
const notificationRoute = require('./notification')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3');
const config = require('../config.json');
const multer = require('multer');

aws.config.update({
    secretAccessKey: config.aws_config.AWS_SECRET_ACCESS_KEY,
    accessKeyId: config.aws_config.AWS_ACCESS_KEY_ID,
    region: config.aws_config.REGION,
    signatureVersion: 'v4'
});

var s3 = new aws.S3()

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'stepoutcontent',
        acl:'public-read',
        key: function (req, file, cb) {
            cb(null, 'service/'+file.originalname); //use Date.now() for unique file keys
        }
    })
});

router.get('/status', (req, res) => {
    res.status(200).send('ok')
})

router.post('/upload-image', upload.single('serviceImage'),  (req, res) => {
    res.json(req.file.location)
})

router.use('/auth', auth);

router.use('/notification', notificationRoute)

router.use(utils.authenticateToken)

router.use('/vendor', utils.isVendor, vendorAuth);

router.use('/user', utils.isUser, userAuth);


module.exports = router;