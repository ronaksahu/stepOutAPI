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
        var avgReview = 0;
        reviewList.forEach(item => {
            const review = {}
            review._id = item._id;
            review.rating = item.rating;
            avgReview += item.rating
            review.review = item.review;
            review.serviceId = item.serviceId._id;
            review.title = item.serviceId.title;
            review.name = item.serviceId.name;
            review.description = item.serviceId.description;
            review.createdAt = item.createdAt;
            review.updatedAt = item.updatedAt;
            reviews.push(review)
        })

        return {reviews, avgReview: avgReview / reviewList.length};
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
    }
}

module.exports = commonUtil;