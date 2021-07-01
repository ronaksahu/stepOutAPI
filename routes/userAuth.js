const { Router } = require('express')
const express = require('express')
const routes = express.Router()

const userController = require('../user/controller')

routes.get('/getServices', userController.getServices)
routes.post('/addToCart', userController.addToCart)
routes.get('/getCart', userController.getCart)
routes.post('/updateProfile', userController.updateProfile)
routes.get('/getProfile', userController.getProfile)
routes.get('/preOrder', userController.preOrder)
routes.get('/placeOrder', userController.placeOrder)
routes.get('/myOrders', userController.myOrders)
routes.post('/postReview', userController.postReview)
routes.get('/getReview', userController.getReview)


module.exports = routes;