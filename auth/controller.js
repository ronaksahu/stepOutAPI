var authService = require('./service')

var authController = {
    register: async function(req, res) {
        try {
            var result = null;
            if(req.body.userType == 'user') {
                result = await authService.registerUser(req)
            } else {
                result = await authService.registerVendor(req)
            }
            res.status(200).json(result)
        } catch(ex) {
            console.log(ex);
            res.sendStatus(500)
        }
    },

    signIn: async function(req, res) {
        try {
            var result = null;
            if(req.body.userType == 'user') {
                result = await authService.signInUser(req)
            } else {
                result = await authService.signInVendor(req)
            }
            res.status(200).json(result)
        } catch(ex) {
            console.log(ex);
            res.sendStatus(500)
        }
    },
    changePassword: async function(req, res) {
        try {
            var result = await authService.changePassword(req);
            res.status(200).json(result)
        } catch (error) {
            console.log(error);
            res.sendStatus(500)
        }
    }
}


module.exports = authController;