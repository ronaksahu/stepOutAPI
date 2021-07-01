const ServiceModel = require('../model/services')
const Vendor = require('../model/vendor')
const Reviews = require('../model/reviews')
const Order = require('../model/order')
const commonUtil = require('../utility/common')

var vendorServices = {
    addService: async function(req) {
        try {
            
            var { title, name, description, image, activity_type, prices, timeBased, timeSlots } = req.body;

            if(timeBased) {
                timeSlots = req.body.timeSlots;

                timeSlots.map(slots => {
                    var date = slots.date.split('/')
                    slots.date = new Date(date[2], date[1] - 1, date[0] - 1)
                    return slots
                })
            }

            const vendor = req.user;

            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            var data = {
                title, 
                name, 
                description, 
                image, 
                activity_type, 
                prices, 
                vendorId: vendor.id, 
                timeBased, 
               }

            if(timeBased) data.timeSlots = timeSlots
            
            const service = new ServiceModel(data);
            const serviceSave = await service.save();
            return serviceSave

        } catch(error) {
            console.log(error);
            return null;
        }
    },
    updateService: async function(req) {
        try {
            
            var { title, name, description, image, activity_type, prices, serviceId, status, timeBased, timeSlots } = req.body;

            const vendor = req.user;

            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            const service = await ServiceModel.findOne({vendorId: vendor.id, _id: serviceId})

            if(!service) return 'service does not exist';

            if(timeBased) {
                timeSlots = req.body.timeSlots;

                timeSlots.map(slots => {
                    var date = slots.date.split('/')
                    slots.date = new Date(date[2], date[1] - 1, date[0] - 1)
                    return slots
                })
            } else {
                timeSlots = []
            }

            service.title = title;
            service.name = name;
            service.description = description;
            service.image = image;
            service.activity_type = activity_type;
            service.prices = prices;
            service.status = status
            service.timeBased = timeBased;
            service.timeSlots = timeBased ? timeSlots : []

            const userData = await service.save()


            //const updateService = await ServiceModel.updateOne({ vendorId: vendor.id, _id: serviceId },{ title, name, description, image, activity_type, prices, status, timeBased, timeSlots } )
            return  userData;
            

        } catch(error) {
            console.log(error);
            return null;
        }
    },
    getService: async function(req) {
        try {

            const vendor = req.user;
            const serviceId = req.query.serviceId;

            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            if(serviceId) {
                
                const serviceData = await ServiceModel.findOne({vendorId: vendor.id, _id: serviceId}, '-vendorId')

                if(!serviceData) return 'service does not exist';

                return serviceData;
            } 

            const serviceData = await ServiceModel.find({vendorId: vendor.id}, '-vendorId')

            return serviceData;

        } catch(error) {
            console.log(error)
            return;
        }
    },
    getReviews: async function(req) {
        try {
            const vendor = req.user;
            const serviceId = req.query.serviceId;

            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            var filter = {}
            if(serviceId) filter.serviceId = serviceId

            const reviews = await Reviews.find(filter).populate({
                path: "serviceId",
                select: "vendorId title name description image",
                match: {vendorId: {$eq: vendor.id}}
            }).lean()
            return commonUtil.vendorReviewFormat(reviews);
            
        } catch(error) {
            console.log(error)
            return;
        }
    },
    getOrders: async function(req) {
        try {
            const vendor = req.user;

            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            const orders = await Order.find({}).populate({
                path: "serviceId",
                select: "vendorId title name description image",
                match: {vendorId: {$eq: vendor.id}}
            })
            return commonUtil.vendorOrderFormat(orders);
        } catch(error) {
            console.log(error)
            return;
        }
    },
    updateOrderStatus: async function(req) {
        try {
            const { orderId, orderStatus } = req.body;
            const vendor = req.user
            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            const orderDB = await Order.findOne({_id: orderId});
            if(orderDB) {
                orderDB.orderStatus = orderStatus;
                await orderDB.save()
            }
            return orderDB;

        } catch(error) {
            console.log(error)
            return;
        }
    }
}

module.exports = vendorServices;