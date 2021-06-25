const ServiceModel = require('../model/services')
const Vendor = require('../model/vendor')
const Reviews = require('../model/reviews')

var vendorServices = {
    addService: async function(req) {
        try {
            
            const { title, name, description, image, activity_type, price } = req.body;

            const vendor = req.user;

            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            const service = new ServiceModel({ title, name, description, image, activity_type, price, vendorId: vendor.id });
            const serviceSave = await service.save();
            return serviceSave

        } catch(error) {
            console.log(error);
            return null;
        }
    },
    updateService: async function(req) {
        try {
            
            const { title, name, description, image, activity_type, price, serviceId, status } = req.body;

            const vendor = req.user;

            const vendorExist = await Vendor.exists({email: vendor.email});

            if(!vendorExist) return 'Vendor does not exist';

            const serviceExist = await ServiceModel.exists({vendorId: vendor.id, _id: serviceId})

            if(!serviceExist) return 'service does not exist';

            const updateService = await ServiceModel.updateOne({ vendorId: vendor.id, _id: serviceId },{ title, name, description, image, activity_type, price, status} )
            return {
                title, name, description, image, activity_type, price, serviceId
            }

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

            const serviceData = await ServiceModel.exists({vendorId: vendor.id, _id: serviceId})

            if(!serviceData) return 'service does not exist';

            const reviews = await Reviews.find({serviceId})

            return reviews;
        } catch(error) {
            console.log(error)
            return;
        }
    }
}

module.exports = vendorServices;