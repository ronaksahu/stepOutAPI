const express = require('express')
const routes = express.Router()

const userController = require('../user/controller')

routes.get('/getServices', userController.getServices)

module.exports = routes;