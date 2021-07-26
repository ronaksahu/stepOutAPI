const notificationService = require('./service')

const notificationController = {

    whishListNotification: async function(req, res) {
        try {
            var result = await notificationService.whishListNotification(req);
            res.status(200).json(result)
        } catch (error) {
            console.log(error);
            res.sendStatus(500)
        }
    }
}

module.exports = notificationController;