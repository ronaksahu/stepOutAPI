const NotificationPermission = require('../model/notification')
const util = require('../utility/utils')
const sendNotification = require('../utility/notification')


const notificationService = {

    whishListNotification: async function(req, res) {
        try {
            
            var options = {}
            var mappingList = []
            mappingList.push({mapping: 'Orders' })
            mappingList.push({mapping: 'All' })
            options.$or = mappingList;

            const notData = await NotificationPermission.aggregate([
                { $match: options },
                {
                  $lookup: {
                    from: "profiles",
                    localField: "userId",
                    foreignField: "userId",
                    as: "userDetail",
                  },
                },
                {
                  $unwind: {
                    path: "$userDetail",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                    $lookup: {
                        from: "whishlists",
                        localField: "userId",
                        foreignField: "userId",
                        as: "whishList",
                    },
                },
                {
                    $unwind: {
                      path: "$whishList",
                      preserveNullAndEmptyArrays: true,
                    },
                },
                {
                  $project: {
                    mapping: 1,
                    "userDetail.deviceToken": 1,
                    "userDetail.firstName": 1,
                    "userDetail.lastName": 1,
                    "whishList": 1
                  },
                }
              ])
              return notData;
              const deviceIDList = util.getDeviceID(notData)

              await sendNotification(deviceIDList, "message")

              return deviceIDList;

        } catch (error) {
            console.log(error);
            return ;
        }
    }
}

module.exports = notificationService;