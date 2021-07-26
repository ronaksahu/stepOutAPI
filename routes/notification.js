const express = require('express')
const routes = express.Router()
const notificationController = require('../notification/controller')

routes.post('/sendWhishListNotification', notificationController.whishListNotification)


module.exports = routes;