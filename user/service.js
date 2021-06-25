const User = require('../model/user')
const ServiceModel = require('../model/services')

const userService = {
    getService: async function(req) {
        try {
            const user = req.user;

            const userExist = User.exists({email: user.email})
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
    }
}

module.exports = userService;