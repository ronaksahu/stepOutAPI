const request = require('../utility/request')
const config = require('../config')
const utils = require('./utils')
const TimeSlot = require('../model/timeSlot')

var commonUtil = {
    formatCart: function(cartList) {
        var cartObj = {}
        var formatCartList = []
        var totalAmount = 0
        var cartItemCount = 0
        cartObj.serviceList = formatCartList

        cartRemove = []
        
        if(cartList.length) {
            cartItemCount = cartList.length
            cartList.forEach(item => {
                var cartItem = {}
                cartItem._id = item._id;
                cartItem.category = item.category;
                cartItem.priceType = item.priceType;
                cartItem.amount = item.amount;
                cartItem.totalAmount = item.totalAmount;
                cartItem.quantity = item.quantity;
                var timeSlotPassed = this.isTimeSlotPassed(item.timeSlot)
                if(!timeSlotPassed) {
                    cartRemove.push(item._id);
                    return;
                }
                cartItem.timeSlot = item.timeSlot;
                cartItem.serviceId = item.serviceId._id;
                cartItem.title = item.serviceId.title;
                cartItem.name = item.serviceId.name;
                cartItem.description = item.serviceId.description;
                var pinImage = item.serviceId.images.filter(imageObj => imageObj.pin == true)
                cartItem.image = pinImage[0].url;
                totalAmount += item.totalAmount
                formatCartList.push(cartItem)
            })
        }
        cartObj.totalAmount = totalAmount
        cartObj.cartItemCount = formatCartList.length
        return {cartObj, cartRemove};

    },
    isTimeSlotPassed: function(timeSlot) {
        var slotDate = timeSlot.date;
        var todayDate = new Date(new Date().toUTCString());
        if(todayDate <= slotDate) {
            var fromTime = timeSlot.from
            console.log(todayDate.getHours(), todayDate.getMinutes())
            if(todayDate < slotDate) return true;
            if(todayDate == slotDate && (todayDate.getHours() < fromTime.split(':')[0])) return true;
            if(todayDate.getHours() == fromTime.split(':')[0] && todayDate.getMinutes() < fromTime.split(':')[1]) return true;
        }
        return false;
    },
    formatOrder: function(orderList) {
        var formatOrderList = []
        if(orderList.length) {
            orderList.forEach(item => {
                var orderItem = {}
                orderItem._id = item._id;
                orderItem.quantity = item.quantity;
                orderItem.timeSlot = item.timeSlot;
                orderItem.price = item.price;
                orderItem.orderStatus = item.orderStatus;
                orderItem.transactionStatus = item.transactionStatus;
                formatOrderList.push(orderItem)
            })
        }
        return formatOrderList;
    },
    formatMyOrders: function(myOrderList) {
        var formatMyOrderList = []
        myOrderList.forEach(order => {
            var myOrder = {}
            myOrder.orderId = order._id;
            myOrder.quantity = order.quantity;
            myOrder.timeSlot = order.timeSlot;
            myOrder.price = order.price;
            myOrder.totalPrice = order.totalPrice;
            myOrder.orderStatus = order.orderStatus;
            myOrder.serviceId = order.serviceId._id;
            myOrder.title = order.serviceId.title;
            myOrder.name = order.serviceId.name;
            myOrder.description = order.serviceId.description;
            var pinImage = order.serviceId.images.filter(imageObj => imageObj.pin == true)
            myOrder.image = pinImage[0].url;
            myOrder.createdAt = order.createdAt;
            myOrder.updatedAt = order.updatedAt;

            formatMyOrderList.push(myOrder)
        })

        return formatMyOrderList;
    },
    reviewFormatData: function(reviewList) {
        var reviews = []
        var totalRating = 0;
        if(reviewList.length == 0) {
            return { reviews: [], avgRating: 0}
        }
        reviewList.forEach(item => {
            const review = {}
            review._id = item._id;
            review.rating = item.rating ? item.rating : 0;
            totalRating += item.rating ? item.rating : 0
            if(!item.review) return;
            review.review = item.review;
            review.serviceId = item.service._id;
            review.title = item.service.title;
            review.name = item.userDetail.firstName+' '+item.userDetail.lastName;
            review.description = item.service.description;
            var pinImage = item.service.images.filter(imageObj => imageObj.pin == true)
            review.image = pinImage[0].url;
            review.createdAt = item.createdAt;
            reviews.push(review)
        })

        return {reviews, avgRating: totalRating / reviewList.length};
    },
    vendorOrderFormat: function(orderList) {
        var formatOrderList = []
        orderList.forEach(item => {
            var order = {}
            order.orderId = item._id;
            order.timeSlot = item.timeSlot;
            order.quantity = item.quantity;
            order.price = item.price;
            order.orderStatus = item.orderStatus;
            order.transactionStatus = item.transactionStatus;
            order.createdAt = item.createdAt;
            order.updatedAt = item.updatedAt;
            order.serviceId = item.service._id;
            order.title = item.service.title;
            order.name = item.service.name;
            order.description = item.service.description;
            var pinImage = item.service.images.filter(imageObj => imageObj.pin == true)
            order.image = pinImage[0].url;
            order.userDetail = item.userDetail;
            formatOrderList.push(order)
        })
        return formatOrderList
    },
    vendorReviewFormat: function(reviewList) {
        var reviewFormatList = []
        reviewList.forEach(item => {
            var review = {}
            review._id = item._id
            review.rating = item.rating
            review.review = item.review
            review.createdAt = item.createdAt
            review.updatedAt = item.updatedAt
            review.serviceId = item.serviceId
            review.firstName = item.userDetail.firstName
            review.lastName = item.userDetail.lastName
            review.profileImage = item.userDetail.profileImage

            reviewFormatList.push(review)
        })
        return reviewFormatList;
    },
    responseDataV2(status, statusCode, message, data) {
        var response = {}
        response.status = status || 'failure'
        response.statusCode = statusCode || 500
        if(message) {
            response.error = message
        }
        response.data = data || {}
        return response;
    },
    formatUserData: function(userData) {
        var formatUser = {}
        formatUser.email = userData.userData.email
        formatUser.socialLogin = userData.userData.socialLogin
        if(userData.userData.profile.length > 0) {
            var profile = userData.userData.profile[0]
            formatUser.firstName = profile.firstName || ''
            formatUser.lastName = profile.lastName || ''
            formatUser.profileImage = profile.profileImage || ''
            formatUser.DOB = profile.DOB || {}
        }
        
        formatUser.JWT_TOKEN = userData.JWT_TOKEN
        return formatUser;
    },
    formatGetService: async function(serviceList, req) {
        var dataList = []
        
      //  serviceList.forEach(async item => {
        for(var i = 0 ; i < serviceList.length ; i++) {
            var item = serviceList[i]
            var service = {}
            var isAvailable = commonUtil.checkForAvailability(item.prices)
            if(!isAvailable) continue;
            service._id = item._id
            service.activity_type = item.activity_type
            service.title = item.title
            service.name = item.name
            service.contactInfo = item.contactInfo
            service.description = item.description
            var pinImage = item.images.filter(imageObj => imageObj.pin == true)
            service.pinImage = pinImage[0].url;
            service.images = item.images.filter(imageObj => {
                if(imageObj.pin == undefined || imageObj.pin == false) {
                    return true
                }
                return false;
            }).map(imageObj => {
                return imageObj.url
            })
            service.description = item.description
            var catArr = []
            if(item.prices.length == 0) return;
            item.prices.forEach(cat => {
                if(cat.prices.length == 0) return;
                var catObj = {}
                var priceArr = []
                cat.prices.forEach(priceEle => {
                    var priceObj = {}
                    if(priceEle.availability > 0) {
                        priceObj = priceEle;
                        priceArr.push(priceObj)
                    }
                })
                if(priceArr.length == 0 ) return;
                catObj._id = cat._id 
                catObj.category = cat.category 
                catObj.prices = priceArr 
                catArr.push(catObj)
            })
            service.prices = catArr
            service.timeBased = item.timeBased

            if(item.timeBased) {
                service.timeSlots = item.timeSlots
            }
            var review = await commonUtil.getReview(item._id.toString(), req);
            service.avgRating = Number(review.avgRating)
            if(req.query.serviceId) {
                service.review = review.reviews
            }
            var serviceLatLon = null;
            if(item.addressDetail) {
                serviceLatLon = await this.getLatLon(item.addressDetail, req)
                service.location = serviceLatLon
            }
            if(item.addressDetail && req.body.userLocation) {
                service.distance = Number(utils.distance(req.body.userLocation, serviceLatLon)).toFixed(2);
            }
            service.amenities = item.amenities
            dataList.push(service)
        }
        return dataList;
    },
    getReview: async function(serviceId, req) {
        var ratings = 0;
        const header = {
            Authorization: req.headers.authorization,
            'Content-Type': 'application/json'
        }
        var reviewList = await request.get('http://localhost:8800/api/user/getReview', { serviceId }, header)
        reviewList = JSON.parse(reviewList)
        return reviewList
    },
    getLatLon: async function(address){
        const addressDetail = address.address+' '+address.street+ ' '+address.city;
        var body = {
            address: addressDetail,
            key: config.GoogleAPIKey
        }
        var destLatLon = await request.get('https://maps.googleapis.com/maps/api/geocode/json', body, '', 0 );
        destLatLon = JSON.parse(destLatLon)
        return destLatLon.results[0].geometry.location;
    },
    formatWhishList: async function(whishList) {
        var formatWhishList = [];
        whishList[0].serviceId.forEach(item => {
            var service = {}
            service.serviceId = item._id;
            service.title = item.title;
            service.name = item.name;
            service.description = item.description;
            var pinImage = item.images.filter(imageObj => imageObj.pin == true)
            service.image = pinImage[0].url;
            formatWhishList.push(service)
        })
        return formatWhishList;
    },
    formatNotificationPermission: async function(notifications) {
        console.log(notifications)
        var formatNotification = {}
        notifications.mapping.forEach(noti => {
            formatNotification[noti.key] = true;
        })
        return formatNotification;
    },
    formatMappingData: async function(mappingList) {
        var formatData = []
        if(mappingList.length == 0) return { status: false }
        mappingList.forEach(service => {
            var formatService = {}
            var category = []
            formatService.serviceId = service._id;
            formatService.title = service.title;
            if(service.prices.length == 0) return {}
            service.prices.forEach(cat => {
                var catObj = {}
                catObj.categoryId = cat._id
                catObj.categoryName = cat.category
                if(cat.prices.length == 0) return;
                var priceArr = []
                catObj.prices = priceArr
                cat.prices.forEach(price => {
                    var priceObj = {}
                    priceObj.priceId = price._id;
                    priceObj.title = price.title;
                    priceObj.amount = price.amount;
                    priceObj.availability = price.availability;
                    priceArr.push(priceObj)
                })
                category.push(catObj)
            })
            if(category.length == 0) return;
            formatService.prices = category;
            formatData.push(formatService)
        })
        
        return formatData
    },
    checkForAvailability: function(prices) {
        var isAvailable = false;
        if(prices.length == 0) return false;

        prices.forEach(cat => {
            if(!cat.prices && cat.prices.length == 0) return;
            cat.prices.forEach(price => {
                if(price.availability > 0) {
                    isAvailable = true;
                    return;
                }
            })
        })
        return isAvailable;
    },
    getSlotByDate: async function(start, end, priceId) {
        return await TimeSlot.aggregate([
            { 
                "$match": { 
                    "priceId": priceId,
                    "timeSlots.date": { "$gte": start, "$lte": end }
                } 
            },
            {
                "$project": {
                    "name": 1,
                    "values": {
                        "$filter": {
                            "input": "$timeSlots",
                            "as": "timeSlot",
                            "cond": { 
                                "$and": [
                                    { "$gte": [ "$$timeSlot.date", start ] },
                                    { "$lte": [ "$$timeSlot.date", end ] }
                                ]
                            }
                        }
                    }
                }
            }
        ])
    }
}

module.exports = commonUtil;