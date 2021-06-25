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
    }
}

module.exports = userController;