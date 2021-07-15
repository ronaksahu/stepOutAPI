const { Router } = require('express');
const express = require('express');
const util = require('../utility/utils');
const routes = express.Router()
const vendorController = require('../vendor/controller')

routes.use(util.validateVendor)
routes.post('/addServices', vendorController.addService);
routes.post('/addPricesAndAvailability', vendorController.addPriceAndAvailability);
routes.post('/updatePricesAndAvailability', vendorController.updatePriceAndAvailability);
routes.post('/deletePriceCategory', vendorController.deletePriceCategory);
routes.post('/addTimeSlot', vendorController.addTimeSlot);
routes.post('/addBulkAvailabilityAndSlot', vendorController.addBulkAvailabilityAndSlots);
routes.post('/updateServices', vendorController.updateService);
routes.get('/getServices', vendorController.getService);
routes.get('/getReviews', vendorController.getReviews);
routes.get('/orderList', vendorController.getOrder);
routes.post('/updateOrderStatus', vendorController.updateOrderStatus);
routes.get('/getServiceMapping', vendorController.getServiceMapping)

module.exports = routes;