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

    }
}

module.exports = commonUtil;