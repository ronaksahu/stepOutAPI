const request = require('../utility/request')
const config = require('../config')
const utils = require('./utils')

var commonUtil = {
    formatCart: function(cartList) {
        var cartObj = {}
        var formatCartList = []
        var totalAmount = 0
        var cartItemCount = 0
        cartObj.cartList = formatCartList
        
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
                cartItem.timeSlot = item.timeSlot;
                cartItem.serviceId = item.serviceId._id;
                cartItem.title = item.serviceId.title;
                cartItem.name = item.serviceId.name;
                cartItem.description = item.serviceId.description;
                cartItem.image = item.serviceId.image;
                totalAmount += item.totalAmount
                formatCartList.push(cartItem)
            })
        }
        cartObj.totalAmount = totalAmount
        cartObj.cartItemCount = cartItemCount
        return cartObj;

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
            myOrder._id = order._id;
            myOrder.quantity = order.quantity;
            myOrder.timeSlot = order.timeSlot;
            myOrder.price = order.price;
            myOrder.orderStatus = order.orderStatus;
            myOrder.serviceId = order.serviceId._id;
            myOrder.title = order.serviceId.title;
            myOrder.name = order.serviceId.name;
            myOrder.description = order.serviceId.description;
            myOrder.image = order.serviceId.image;
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
            review.review = item.review;
            review.serviceId = item.service._id;
            review.title = item.service.title;
            review.name = item.userDetail.firstName+' '+item.userDetail.lastName;
            review.description = item.service.description;
            review.image = item.service.image;
            review.createdAt = item.createdAt;
            reviews.push(review)
        })

        return {reviews, avgRating: totalRating / reviewList.length};
    },
    vendorOrderFormat: function(orderList) {
        var formatOrderList = []
        orderList.forEach(item => {
            var order = {}
            order._id = item._id;
            order.timeSlot = item.timeSlot;
            order.quantity = item.quantity;
            order.price = item.price;
            order.orderStatus = item.orderStatus;
            order.transactionStatus = item.transactionStatus;
            order.createdAt = item.createdAt;
            order.updatedAt = item.updatedAt;
            order.serviceId = item.serviceId._id;
            order.title = item.serviceId.title;
            order.name = item.serviceId.name;
            order.description = item.serviceId.description;
            order.image = item.serviceId.image;
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
        response.status = status || false
        response.statusCode = statusCode || 500
        response.message = message || 'No results found'
        response.data = data || {}
        if (!message) delete response.message
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
            service._id = item._id
            service.activity_type = item.activity_type
            service.title = item.title
            service.name = item.name
            service.description = item.description
            service.image = item.image
            service.description = item.description
            service.prices = item.prices
            service.timeBased = item.timeBased
            if(item.timeBased) {
                service.timeSlots = item.timeSlots
            }
            var review = await commonUtil.getReview(item._id.toString(), req);
            service.avgRating = Number(review.avgRating)
            if(serviceList.length == 1) {
                service.review = review.reviews
            }
            if(item.addressDetail) {
                serviceLatLon = await this.getLatLon(item.addressDetail, req)
                service.distance = Number(utils.distance(req.body.userLocation, serviceLatLon)).toFixed(2);
            }
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
        whishList.forEach(item => {
            var service = {}
            service.serviceId = item.serviceId._id;
            service.title = item.serviceId.title;
            service.name = item.serviceId.name;
            service.description = item.serviceId.description;
            service.image = item.serviceId.image;
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
    }
}

module.exports = commonUtil;