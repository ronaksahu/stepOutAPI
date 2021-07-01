const vendorServices = require('./service')

var vendorController = {
    addService: async function(req, res) {
        try {
            var result = await vendorServices.addService(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error);
            res.sendStatus(500)
        }
    },
    updateService: async function(req, res) {
        try {
            var result = await vendorServices.updateService(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error);
            res.sendStatus(500)
        }
    },
    getService: async function(req, res) {
        try {
            var result = await vendorServices.getService(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error);
            res.sendStatus(500)
        }
    },
    getReviews: async function(req, res) {
        try {
            var result = await vendorServices.getReviews(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error);
            res.sendStatus(500)
        }
    },
    getOrder: async function(req, res) {
        try {
            var result = await vendorServices.getOrders(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    },
    updateOrderStatus: async function(req, res) {
        try {
            var result = await vendorServices.updateOrderStatus(req);
            res.status(200).json(result)
        } catch(error) {
            console.log(error)
            res.sendStatus(500)
        }
    }
}

module.exports = vendorController;