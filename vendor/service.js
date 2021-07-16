const ServiceModel = require('../model/services')
const Vendor = require('../model/vendor')
const Reviews = require('../model/reviews')
const Order = require('../model/order')
const commonUtil = require('../utility/common')
const utils = require('../utility/utils')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const TimeSlots = require('../model/timeSlot')


var vendorServices = {
    addService: async function(req) {
        try {
            
            var { title, name, description, image, activity_type, price_category, timeBased, addressDetail } = req.body;

          /*  if(timeBased) {
                timeSlots = req.body.timeSlots;

                timeSlots.map(slots => {
                    var date = slots.date.split('/')
                    slots.date = new Date(date[2], date[1] - 1, date[0] - 1)
                    return slots
                })
            }*/

            const vendor = req.user;

            var priceCat = []
            if(price_category.length > 0){
                price_category.forEach(cat => {
                    priceCat.push({category: cat})
                })
            }

            var data = {
                title, 
                name, 
                description, 
                image, 
                activity_type, 
                prices: priceCat, 
                vendorId: vendor.id, 
                timeBased, 
                addressDetail
               }

           // if(timeBased) data.timeSlots = timeSlots
            
            const service = new ServiceModel(data);
            const serviceSave = await service.save();
            if(serviceSave) {
                return {
                    status: true
                }
            }
            return {
                status: false
            }

        } catch(error) {
            console.log(error);
            return null;
        }
    },
    updateService: async function(req) {
        try {
            
            var { serviceId, title, name, description, status, image, activity_type, price_category, timeBased, addressDetail } = req.body;

            const vendor = req.user;

            const service = await ServiceModel.findOne({vendorId: vendor.id, _id: serviceId})

            if(!service) return 'service does not exist';

            var priceCat = []
            if(price_category && price_category.length > 0){
                price_category.forEach(cat => {
                    priceCat.push({category: cat})
                })
            }

            const query = { vendorId: vendor.id, _id: serviceId }

            const update = {
                title,
                name ,
                description ,
                image ,
                activity_type ,
                status ,
                timeBased ,
                addressDetail,
                prices: priceCat.length == 0 ? undefined : priceCat
            }

            var options = { multi: false, runValidators: true, omitUndefined: true }
            await ServiceModel.updateOne (query, { "$set": update }, options )
            return  {status: true};
            

        } catch(error) {
            console.log(error);
            return null;
        }
    },
    getService: async function(req) {
        try {

            const vendor = req.user;
            const serviceId = req.query.serviceId;

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

            var filter = {}
            if(serviceId) filter.serviceId = serviceId

            /*const reviews = await Reviews.find(filter).populate({
                path: "serviceId",
                select: "vendorId title name description image",
                match: {vendorId: {$eq: vendor.id}}
            }).lean()*/
            const match = filter.serviceId ? { serviceId: ObjectId(serviceId) } : {}
            
            const reviews = await Reviews.aggregate([ 
                { "$match": match },
                {
                    $lookup: {
                        from: "profiles",
                        localField: "userId",
                        foreignField: "userId",
                        as: "userDetail"                
                    }
            }, {
                $unwind: {
                    path: "$userDetail",
                    preserveNullAndEmptyArrays: true
                }
            }])

            return commonUtil.vendorReviewFormat(reviews);
            
        } catch(error) {
            console.log(error)
            return;
        }
    },
    getOrders: async function(req) {
        try {
            const vendor = req.user;

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
    },
    addPriceAndAvailability: async function(req) {
        try {
            const vendor = req.user;
            const { serviceId, categoryId, prices } = req.body

    
            const updatePrice = await ServiceModel.updateOne({_id: serviceId, vendorId: vendor.id, 'prices._id': categoryId},
            { $push: {
                'prices.$.prices': {$each : prices}
            }})
            if(updatePrice.n && updatePrice.nModified) {
                return {
                    status: true,
                }
            } else {
                return { status: false }
            }
            
        } catch(error) {
            console.log(error);
            return {status: false}
        }  

    },
    updatePriceAndAvailability: async function(req) {
        try {
            const vendor = req.user;
            const { serviceId, categoryId, prices } = req.body

            const serviceData = await ServiceModel.findOne({_id: serviceId, vendorId: vendor.id, 'prices._id': categoryId});
            serviceData.prices.forEach(cat => {
                if(cat._id == categoryId) {
                    cat.prices.forEach(price => {
                        prices.forEach(priceUpdate => {
                            if(price._id == priceUpdate.priceId) {
                                price.title = priceUpdate.title;
                                price.amount = priceUpdate.amount
                                price.availability = priceUpdate.availability
                                return;
                            }
                        })

                    })
                }
                return;
            })
            var serviceDataSave = await serviceData.save()

            return serviceDataSave;
           
        } catch (error) {
            console.log(error)
            return;
        }
    },
    deletePriceCategory: async function(req) {
        try {
            const vendor = req.user;
            const { serviceId, categoryId, priceId, type } = req.body
            var pull = {};
            if(type == 1) {
               pull = {"prices": { _id: categoryId }}
            }
            if(type == 2) {
                pull = {"prices.$.prices": { _id: priceId }}
            }
            var updateData = await ServiceModel.updateOne({ _id: serviceId, vendorId: vendor.id, 'prices._id': categoryId }, {
                $pull: { "prices.$.prices": { _id: priceId } }
            })
            if(updateData.n && updateData.nModified) {
                return {
                    status: true
                }
            } else {
                return {status: false}
            }
        } catch (error) {
            console.log(error)
            return;
        }
    },
    addTimeSlot: async function(req) {
        try {
            const vendor = req.user;
            const { serviceId, categoryId, priceId, timeSlots } = req.body;
            
            const serviceData = await ServiceModel.findOne({_id: serviceId, vendorId: vendor.id}).lean();
            var catExist = false;
            var priceIdExist = false;
            serviceData.prices.forEach(cat => {
                if(cat._id == categoryId) {
                    catExist = true;
                    cat.prices.forEach(price => {
                        if(price._id == priceId) {
                            priceIdExist = true
                            return;
                        }
                    })
                    return;
                }
            })
            if(!catExist) return 'Category does not exist'
            if(!priceIdExist) return 'PriceId does not exist'

            var dateObj = []

            timeSlots.forEach(timeSlot => {
                console.log(timeSlot.date)
                var date = timeSlot.date.split('/')
                timeSlot.date = new Date(Date.UTC(Number(date[2]), Number(date[1]) - 1, Number(date[0])))
                dateObj.push( {'timeSlots.date': timeSlot.date} )
                console.log(timeSlot.date)
            })

            var query = { priceId: priceId },
            update = { timeSlots: timeSlots },
            options = { upsert: true, new: true, setDefaultsOnInsert: true };
            
            const timeSlotUpdate = await TimeSlots.findOneAndUpdate(query, update, options)

            return timeSlotUpdate;

        } catch (error) {
            console.log(error)
            return;
        }
    },
    getServiceMapping: async function(req) {
        try {

            const vendor = req.user;
            const serviceId = req.query.serviceId;
            const match = { status: 'Active' , vendorId: vendor.id }
            const serviceMapping = await ServiceModel.find(match).select({
                title: 1,
                prices: 1,
            }).lean()
            return commonUtil.formatMappingData(serviceMapping);

        } catch(error) {
            console.log(error);
            return;
        }
    },
    addBulkAvailabilityAndSlots: async function(req){
        try {
            const vendor = req.user;

            const { serviceId, categoryId, priceId, slots, dateRange, days } = req.body;

            const dateList = utils.getDatesBetweenRange(dateRange, days)

            var dateSlots = []
            dateList.forEach(date => {
                var slotObj = {}
                //date = date.split('-')
               // slotObj.date = new Date(Date.UTC(Number(date[0]), Number(date[1]) - 1, Number(date[2])))
               slotObj.date = date
                slotObj.slots = slots;
                dateSlots.push(slotObj)
            })

            var query = { priceId }
            var update = { timeSlots: dateSlots }
            const updateSlots = await TimeSlots.updateOne(query, update);
            if(updateSlots.n && updateSlots.nModified) {
                return { status: true }
            }
            return { status: false }

        } catch (error) {
            console.log(error)
            return ;
        }
    }
}

module.exports = vendorServices;