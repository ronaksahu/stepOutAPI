const express = require('express')
const routes = express.Router()
const authController = require('../auth/controller')
const {registerValidate, validateSignIn} = require('../utility/validators')

routes.post('/register', registerValidate, authController.register)
routes.post('/signIn', validateSignIn, authController.signIn)
routes.post('/changePassword', authController.changePassword)
routes.post('/sendOTP', authController.sendOTP)
routes.post('/verifyOTP', authController.verifyOtp)



module.exports = routes;