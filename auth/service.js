const User = require('../model/user')
const Vendor = require('../model/vendor')
const Profile = require('../model/profile')
const utils = require('../utility/utils')
const bcrypt = require('bcrypt');
const commonUtil = require('../utility/common')


var authService = {
    registerUser: async function(req) {
        try {

            const {email, password, firstName, lastName, DOB, contactNo } = req.body;
        
            const userAlreadyExist = await User.exists({email});
            if(userAlreadyExist) return commonUtil.responseDataV2('failure', 200, 'Email already registered');

            const user = new User({email, password})
            await user.save()

            var profData = new Profile({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                DOB: DOB || undefined,
                contactNo: contactNo || undefined,
                userId: user._id
            })

            await profData.save()

            const JWT_TOKEN = utils.generateAccessToken({id: user._id, email: user.email, userType: req.body.userType })

            return commonUtil.responseDataV2('success', 200, null, {
                email,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                DOB: DOB || undefined,
                contactNo: contactNo || undefined,
                socialLogin: false,
                JWT_TOKEN
            });

        } catch(error) {
            console.log(error)
            return commonUtil.responseDataV2('failure', 500)
        }
        
    },
    registerVendor: async function(req) {
        try {

            const {email, password, firstName, lastName, DOB, contactNo } = req.body;
        
            const vendorAlreadyExist = await Vendor.exists({email});
            if(vendorAlreadyExist) return commonUtil.responseDataV2('failure', 200, "email is not registered");
            const vendor = new Vendor({email, password})
            await vendor.save()

            var profData = new Profile({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                DOB: DOB || undefined,
                contactNo: contactNo || undefined,
                userId: vendor._id
            })

            await profData.save()

            const JWT_TOKEN = utils.generateAccessToken({id: vendor._id, email: vendor.email, userType: req.body.userType })

            return commonUtil.responseDataV2('success', 200, null, {
                email,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                DOB: DOB || undefined,
                contactNo: contactNo || undefined,
                socialLogin: false,
                JWT_TOKEN
            });

        } catch(error) {
            console.log(error)
            return commonUtil.responseDataV2('failure', 500)
        }
    },
    signInUser: async function(req) {
        try {
            const {email, password} = req.body;

            var userData = await User.aggregate([
                {"$match": { email: email} },{
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "userId",
                    as: "profile"                
                }
             }]);
            
            if(userData.length == 0) return commonUtil.responseDataV2('failure', 200, "email is not registered");
            userData = userData[0]
            const passMatched = await bcrypt.compare(password, userData.password);
     
            if(!passMatched) return commonUtil.responseDataV2('failure', 200, "Incorrect Password");
    
            const JWT_TOKEN = utils.generateAccessToken({id: userData._id, email: userData.email, userType: req.body.userType })

            return commonUtil.responseDataV2('success', 200, null, commonUtil.formatUserData({
                userData: userData,
                JWT_TOKEN
            }));

        } catch(error) {
            console.log(error)
            return commonUtil.responseDataV2('failure', 500)
        }
    },
    signInVendor: async function(req) {
        try {
            const {email, password} = req.body;

            var userData = await Vendor.aggregate([
                {"$match": { email: email} },{
                $lookup: {
                    from: "profiles",
                    localField: "_id",
                    foreignField: "userId",
                    as: "profile"                
                }
             }]);
             if(userData.length == 0) return commonUtil.responseDataV2('failure', 200, "email is not registered");
             userData = userData[0]
            const passMatched = await bcrypt.compare(password, userData.password);
     
            if(!passMatched) return commonUtil.responseDataV2('failure', 200, "Incorrect Password");
    
            const JWT_TOKEN = utils.generateAccessToken({id: userData._id, email: userData.email, userType: req.body.userType })

            return commonUtil.responseDataV2('success', 200, null, commonUtil.formatUserData({
                userData: userData,
                JWT_TOKEN
            }));
        } catch(error) {
            console.log(error)
            return commonUtil.responseDataV2('failure', 500)
        }
    },
    changePassword: async function(req) {
        
        try {
            const {email, password, userType} = req.body;

            if(userType == 'user') {
                const user = await User.findOne({email});
                if(!user) return commonUtil.responseDataV2('failure', 200, 'emailId is not registered');
                user.password = password;
                const updateUser = await user.save()
                return  commonUtil.responseDataV2('success', 200, null, 'Password Updated Successfully!!');
            }
            const vendor = await Vendor.findOne({email});
            if(!vendor) return commonUtil.responseDataV2('failure', 200, 'emailId is not registered');
            vendor.password = password;
            const updateUser = await vendor.save()
            return  commonUtil.responseDataV2('success', 200, null, 'Password Updated Successfully!!');

        } catch(error) {
            console.log(error);
            return commonUtil.responseDataV2('failure', 500)
        }
    },
    sendOTP:  function(req) {
        try {
            const phoneNo = req.body.phoneNo;
            const otp = utils.generateOTP(phoneNo);
            console.log(otp)
            return commonUtil.responseDataV2('success', 200);
        } catch(error) {
            console.log(error)
            return commonUtil.responseDataV2('failure', 500)
        }
    },
    verifyOtp:  function(req) {
        try {
            const { hash, phoneNo, otp } = req.body;
            const otpVerified = utils.verifyOtp(phoneNo, hash, otp);
            return commonUtil.responseDataV2('success', 200, null, {otpVerified});
        } catch(error) {
            console.log(error)
            return commonUtil.responseDataV2('failure', 500)
        }
    }
}

module.exports = authService;