const userService = require('./service')

const userController = {
    getServices: async function(req, res) {
        try {
            var result = await userService.getService(req);
            res.status(200).json(result)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    addToCart: async function(req, res) {
        try {
            var result = await userService.addToCart(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    getCart: async function(req, res) {
        try {
            var result = await userService.getCart(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    updateProfile: async function(req, res) {
        try {
            var result = await userService.updateProfile(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    getProfile: async function(req, res) {
        try {
            var result = await userService.getProfile(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    preOrder: async function(req, res) {
        try {
            var result = await userService.getPreOrder(req);
            res.status(200).json(result);
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    placeOrder: async function(req, res) {
        try {
            var result = await userService.placeOrder(req);
            res.status(200).json(result) 
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    myOrders: async function(req, res) {
        try {
            var result = await userService.myOrders(req);
            res.status(200).json(result);
        } catch(error) {
            console.log(error);
            res.sendStatus(500)
        }
    },
    postReview: async function(req, res) {
        try {
            var result = await userService.postReview(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    getReview: async function(req, res) {
        try {
            var result = await userService.getReview(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    addToWhishList: async function(req, res) {
        try {
            var result = await userService.addToWhishList(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    getWhishList: async function(req, res) {
        try {
            var result = await userService.getWhishList(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    setDeviceId: async function(req, res) {
        try {
            var result = await userService.setDeviceId(req);
            res.status(200).json(result)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    updateNotificationPermission: async function(req, res) {
        try {
            var result = await userService.updateNotificationPermission(req)
            res.status(200).json(result)
        } catch (error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

module.exports = userController;