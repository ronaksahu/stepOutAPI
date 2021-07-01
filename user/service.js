const User = require('../model/user')
const ServiceModel = require('../model/services')
const Cart = require('../model/cart')
const commonUtil = require('../utility/common')
const Profile = require('../model/profile')
const Review = require('../model/reviews')
const Order = require('../model/order')

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
    },
    updateProfile: async function(req) {
        try {
            const user = req.user;

            const userExist = await User.exists({email: user.email})
            if (!userExist) return 'User does not exist';

            var { firstName, lastName, DOB, contactNo }= req.body;

            var date = DOB.split('/')
            DOB = new Date(date[2], date[1] - 1, date[0] )


            const profile = await Profile.findOne({userId: user.id})

            if(profile) {
                profile.firstName = firstName
                profile.lastName = lastName
                profile.DOB = DOB
                profile.contactNo = contactNo
                await profile.save()
            } else {
                const profile = new Profile({ firstName, lastName, DOB, contactNo, userId: user.id })
                await profile.save()
            }

            return { firstName, lastName, DOB, contactNo, email: user.email };

        } catch(error) {
            console.log(error);
            return;
        }
    },
    getProfile: async function(req) {
        try {
            const user = req.user;

            const userExist = await User.exists({email: user.email})
            if (!userExist) return 'User does not exist';

            var profile = await Profile.findOne({ userId: user.id }).select({"_id": 0}).lean()
            if(!profile) {
                return {
                    firstName: '',
                    lastName: '',
                    DOB: '',
                    contactNo: '',
                    email: user.email
                }
            }
            profile.emailId = user.email;
            return profile

        } catch(error) {
            console.log(error);
            return;
        }
    },
    getPreOrder: async function(req) {
        try {
            const user = req.user;

            const updatedCart = await Cart.find({userId: user.id}).populate({
                path: "serviceId",
                select: "title name description image"
            }).select({ "userId": 0 }).lean()

            const formatCart = commonUtil.formatCart(updatedCart)

            return formatCart;

        } catch(error) {
            console.log(error);
            return;
        }
    },
    placeOrder: async function(req) {
        try {

            const user = req.user;
            const updatedCart = await Cart.find({userId: user.id}).populate({
                path: "serviceId",
                select: "title name description image"
            }).select({ "userId": 0 }).lean()

            const cartItems = commonUtil.formatCart(updatedCart)
            var orders = []
            cartItems.cartList.forEach(items => {
                var order = {}
                order.userId = user.id
                order.serviceId = items.serviceId
                order.quantity = items.quantity
                order.totalAmount = items.totalAmount
                order.timeSlot = items.timeSlot
                order.price = items.amount
                order.orderStatus = 'Confirm'
                order.transactionStatus = 'Success'
                var orderModel = new Order(order)
                orders.push(orderModel)
            })
            var orderList = await Order.insertMany(orders)

            var cartEmpty = await Cart.deleteMany({ userId: user.id })

            
            return commonUtil.formatOrder(orderList);
        } catch(error) {
            console.log(error)
            return;
        }
    },
    myOrders: async function(req) {
        try {
            
            const user = req.user;

            const orderList = await Order.find({userId: user.id}).populate({
                path: "serviceId",
                select: "title name description image"
            }).select({ "userId": 0 }).lean()

            return commonUtil.formatMyOrders(orderList);

        } catch(error) {
            console.log(error)
            return;
        }
    },
    postReview: async function(req) {
        try {
            
            const { serviceId, rating, review } = req.body;
            const user = req.user;

            const userExist = await User.exists({email: user.email})
            if (!userExist) return 'User does not exist';

            const userVerified = await Order.exists({ userId: user.id, serviceId: serviceId })

            if(!userVerified) return 'User not ordered this Service'

            const reviewModel = Review({ userId: user.id, serviceId, rating, review })

            const postReview = await reviewModel.save()

            return postReview;

        } catch (error) {
            console.log(error)
            return;
        }
    },
    getReview: async function(req) {
        try {
            const user = req.user;

            const userExist = await User.exists({email: user.email})
            if (!userExist) return 'User does not exist';

            const reviewList = await Review.find({ userId: user.id }).populate({
                path: "serviceId",
                select: "title name description image"
            }).select({ "userId": 0 }).lean()

            return commonUtil.reviewFormatData(reviewList)

        } catch (error) {
            console.log(error)
            return;
        }
    }

}

module.exports = userService;