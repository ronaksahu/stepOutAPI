const User = require('../model/user')
const ServiceModel = require('../model/services')
const Cart = require('../model/cart')
const commonUtil = require('../utility/common')

const userService = {
    getService: async function(req) {
        try {
            const user = req.user;

            const userExist = await User.exists({email: user.email})
            if (!userExist) return 'User does not exist';

            let page = parseInt(req.query.page);
            const perPageCount = 10;

            const serviceCount = await ServiceModel.countDocuments({status: 'Active'});

            const pageCount = Math.ceil(serviceCount / perPageCount)
            if(!page) { page = 1 }
            if(page > pageCount) {
                page = pageCount
            }

            const serviceList = await ServiceModel.find({status: 'Active'} , {vendorId: 0}, {skip: (page - 1) * perPageCount, limit: perPageCount });

            return {
                totalServices: serviceCount,
                pageCount,
                serviceList
            };

        } catch(error) {
            console.log(error)
            return;
        }
    },
    addToCart: async function(req) {
        try {
            const { serviceId, categoryType, priceType, quantity, slot } = req.body;

            var date = slot.date.split('/')
            slot.date = new Date(date[2], date[1] - 1, date[0] )

            const user = req.user;

            const userExist = await User.exists({email: user.email})
            if (!userExist) return 'User does not exist';

            const service = await ServiceModel.findOne({_id: serviceId}).lean();
            if(!service) return 'Service does not exist';
            var price = 0;
            service.prices.forEach(cat => {
                if(cat.category == categoryType) {
                    cat.prices.forEach(prices => {
                        if(prices.title == priceType) {
                            price = prices.amount
                        }
                    })
                }
            })
            var slotAvailable = false;
            service.timeSlots.forEach(timeSlot => {
                 if(Number(timeSlot.date) == Number(slot.date)) {
                    timeSlot.timeSlots.forEach(time => {
                        if(time.from == slot.from && time.to == slot.to) {
                            slotAvailable = true;
                            return;
                        }
                    })
                }
                if (slotAvailable) return;
            })

            if(!slotAvailable) return 'Slot Not Available please select different slot'

            const cart = await Cart.findOne({userId: user.id, serviceId, category: categoryType, priceType: priceType})
            if(!cart) {
                if(quantity > 0) {
                    var addCart = new Cart({userId: user.id, serviceId, category: categoryType, priceType: priceType, amount: price, totalAmount: price* quantity, quantity: quantity, timeSlot: slot})
                    await addCart.save()
                }
            } else {
                if (cart.quantity + quantity <= 0) {
                    await Cart.deleteOne({_id: cart._id})
                } else {

                
                    if(!(cart.timeSlot.date == slot.date && cart.timeSlot.from == slot.from && cart.timeSlot.to ==  slot.to) && slotAvailable) {
                        cart.timeSlot = slot;
                        
                    }
                    
                    cart.quantity = cart.quantity + quantity;
                    cart.totalAmount += quantity * price;
                    await cart.save()
                }
            }
            const updatedCart = await Cart.find({userId: user.id}).populate({
                path: "serviceId",
                select: "title name description image"
            }).select({ "userId": 0 }).lean()

            const formatCart = commonUtil.formatCart(updatedCart)

            return formatCart;
            
        } catch(error) {
            console.log(error)
            return;
        }
    },
    getCart: async function(req) {
        try {
            const user = req.user;

            const userExist = await User.exists({email: user.email})
            if (!userExist) return 'User does not exist';

            const updatedCart = await Cart.find({userId: user.id}).populate({
                path: "serviceId",
                select: "title name description image"
            }).select({ "userId": 0 }).lean()

            const formatCart = commonUtil.formatCart(updatedCart)

            return formatCart;

        } catch (error) {
            console.log(error)
            return;
        }
    }
}

module.exports = userService;