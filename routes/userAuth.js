const express = require('express')
const routes = express.Router()
var multer = require('multer');

const userController = require('../user/controller')

var storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './content/profile');
    },
    filename: function (request, file, callback) {
        callback(null, request.user.id+'.'+file.originalname.split('.').pop())
    }
});

var upload = multer({storage: storage});

routes.post('/getServices', userController.getServices)
routes.post('/addToCart', userController.addToCart)
routes.get('/getCart', userController.getCart)
routes.post('/updateProfile', upload.single('profileImage') , userController.updateProfile)
routes.get('/getProfile', userController.getProfile)
routes.get('/preOrder', userController.preOrder)
routes.get('/placeOrder', userController.placeOrder)
routes.get('/myOrders', userController.myOrders)
routes.post('/postReview', userController.postReview)
routes.get('/getReview', userController.getReview)
routes.post('/addToWhishList', userController.addToWhishList);
routes.get('/getWhishList', userController.getWhishList)
routes.post('/setDeviceId', userController.setDeviceId)
routes.post('/updateNotificationPermission', userController.updateNotificationPermission)
 
module.exports = routes;