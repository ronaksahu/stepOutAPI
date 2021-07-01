const express = require('express')
const routes = express.Router()

const userController = require('../user/controller')

routes.get('/getServices', userController.getServices)
routes.post('/addToCart', userController.addToCart)


module.exports = routes;