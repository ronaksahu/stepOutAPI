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
            if(userAlreadyExist) return 'Email already registered';

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

            return {
                email,
                profile: {
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    DOB: DOB || undefined,
                    contactNo: contactNo || undefined
                },
                JWT_TOKEN
            }

        } catch(error) {
            console.log(error)
        }
        
    },
    registerVendor: async function(req) {
        try {

            const {email, password} = req.body;
        
            const vendorAlreadyExist = await Vendor.exists({email});
            if(vendorAlreadyExist) return 'Email already registered';

            const vendor = new Vendor({email, password})
            await vendor.save()

            const JWT_TOKEN = utils.generateAccessToken({id: vendor._id, email: vendor.email, userType: req.body.userType })

            return {
                email,
                JWT_TOKEN
            }

        } catch(error) {
            console.log(error)
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
            
            if(userData.length == 0) return "email is not registered";
            userData = userData[0]
            const passMatched = await bcrypt.compare(password, userData.password);
     
            if(!passMatched) return "Incorrect Password";
    
            const JWT_TOKEN = utils.generateAccessToken({id: userData._id, email: userData.email, userType: req.body.userType })

            return commonUtil.formatUserData({
                userData: userData,
                JWT_TOKEN
            })

        } catch(error) {
            console.log(error)
        }
    },
    signInVendor: async function(req) {
        try {
            const {email, password} = req.body;

            const user = await Vendor.findOne({email});

            if(!user) return "email is not registered";

            const passMatched = await bcrypt.compare(password, user.password);
     
            if(!passMatched) return "Incorrect Password";
    
            const JWT_TOKEN = utils.generateAccessToken({id: user._id, email: user.email, userType: req.body.userType })

            return {
                email: user.email,
                JWT_TOKEN
            }

        } catch(error) {
            console.log(error)
        }
    },
    changePassword: async function(req) {
        
        try {
            const {email, password, userType} = req.body;

            if(userType == 'user') {
                const user = await User.findOne({email});
                if(!user) return 'emailId is not registered';
                user.password = password;
                const updateUser = await user.save()
                return  'Password Updated Successfully!!'
            }
            const vendor = await Vendor.findOne({email});
            if(!vendor) return 'emailId is not registered';
            vendor.password = password;
            const updateUser = await vendor.save()
            return  'Password Updated Successfully!!'

        } catch(error) {
            console.log(error);
            return;
        }
    },
    sendOTP:  function(req) {
        try {
            const phoneNo = req.body.phoneNo;
            const otp = utils.generateOTP(phoneNo);
            console.log(otp)
            return 'OTP SENT';
        } catch(error) {
            console.log(error)
            return;
        }
    },
    verifyOtp:  function(req) {
        try {
            const { hash, phoneNo, otp } = req.body;
            const otpVerified = utils.verifyOtp(phoneNo, hash, otp);
            return {otpVerified};
        } catch(error) {
            console.log(error)
            return;
        }
    }
}

module.exports = authService;