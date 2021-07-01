const express = require('express');
const vendor = require('../model/vendor');
const routes = express.Router()
const vendorController = require('../vendor/controller')

routes.post('/addServices', vendorController.addService);
routes.post('/updateServices', vendorController.updateService);
routes.get('/getServices', vendorController.getService);
routes.get('/getReviews', vendorController.getReviews);
routes.get('/orderList', vendorController.getOrder);
routes.post('/updateOrderStatus', vendorController.updateOrderStatus);


module.exports = routes;