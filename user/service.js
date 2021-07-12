const User = require("../model/user");
const ServiceModel = require("../model/services");
const Cart = require("../model/cart");
const commonUtil = require("../utility/common");
const Profile = require("../model/profile");
const Review = require("../model/reviews");
const Order = require("../model/order");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const util = require("../utility/utils");

const userService = {
  getService: async function (req) {
    try {
      const user = req.user;
      const serviceId = req.query.serviceId;

      const userExist = await User.exists({ email: user.email });
      if (!userExist) return "User does not exist";

      let page = parseInt(req.query.page);
      const perPageCount = 10;

      const serviceCount = await ServiceModel.countDocuments({
        status: "Active",
      });

      const pageCount = Math.ceil(serviceCount / perPageCount);
      if (!page) {
        page = 1;
      }
      if (page > pageCount) {
        return {
          totalServices: 0,
          pageCount,
          serviceList: [],
        };
      }

      const filters = req.body.filter;
      const activityType = filters.activityType;
      var options = {
        status: "Active",
      };
      var activityArray = [];
      if (activityType.length > 0) {
        activityType.forEach((activity) => {
          activityArray.push({ activity_type: activity });
        });
        options.$or = activityArray;
      }
      if (serviceId) {
        options._id = serviceId;
      }
      var serviceList = null;
      if(req.query.qs) {
        var searchText = req.query.qs;
        serviceList = await ServiceModel.find({$or : [
            { name: { $regex : searchText } },
            { title: { $regex : searchText } },
            { description: { $regex : searchText } }
        ]}).lean()
      } else {
        serviceList = await ServiceModel.find(
            options,
            { vendorId: 0 },
            { skip: (page - 1) * perPageCount, limit: perPageCount }
          ).lean();
      }

      var reviewPromiseArr = [];
      //console.log(req.headers)

      /* console.log(header)
            serviceList.forEach(service => {
                reviewPromiseArr.push(request.get('http://localhost:8800/api/user/getReview', { serviceId: service._id.toString() }, header))
            })
            let reviewData = await Promise.all(reviewPromiseArr)
            console.log(reviewData)*/

      var formatData = await commonUtil.formatGetService(serviceList, req);

      if (req.body.priceRange) {
        formatData = formatData.filter((service) => {
          var minPrice = util.getMinPriceService(service);
          var maxPrice = util.getMaxPriceService(service);
          if (
            minPrice >= req.body.priceRange.min &&
            maxPrice <= req.body.priceRange.max
          ) {
            return true;
          }
        });
      }
      if (req.body.distanceRange) {
        formatData = formatData.filter((service) => {
          var distance = service.distance;

          if (!service.distance) return true;
          if (
            distance >= req.body.distanceRange.min &&
            distance <= req.body.distanceRange.max
          ) {
            return true;
          }
        });
      }
      if (req.body.sort.by == "Rating") {
        formatData.sort((a, b) => {
          if (req.body.sort.sorting == "Ascending") {
            return b.avgRating - a.avgRating;
          }
          if (req.body.sort.sorting == "Descending") {
            return a.avgRating - b.avgRating;
          }
        });
      }
      if (req.body.sort.by == "Title") {
        if (req.body.sort.sorting == "Ascending") {
          formatData.sort((a, b) =>
            a.title > b.title ? 1 : b.title > a.title ? -1 : 0
          );
        }
        if (req.body.sort.sorting == "Descending") {
          formatData.sort((a, b) =>
            a.title > b.title ? -1 : b.title > a.title ? 1 : 0
          );
        }
      }
      if (req.body.sort.by == "Distance") {
        if (req.body.sort.sorting == "Ascending") {
          formatData.sort((a, b) =>
            a.distance > b.distance ? 1 : b.distance > a.distance ? -1 : 0
          );
        }
        if (req.body.sort.sorting == "Descending") {
          formatData.sort((a, b) =>
            a.distance > b.distance ? -1 : b.distance > a.distance ? 1 : 0
          );
        }
      }
      if (req.body.sort.by == "Price") {
        if (req.body.sort.sorting == "Ascending") {
          formatData.sort((a, b) => {
            var aMinPrice = util.getMinPriceService(a);
            var bMinPrice = util.getMinPriceService(b);
            if (aMinPrice > bMinPrice) return -1;
            else if (bMinPrice > aMinPrice) return 1;
            return 0;
          });
        }
        if (req.body.sort.sorting == "Descending") {
          formatData.sort((a, b) => {
            var aMinPrice = util.getMinPriceService(a);
            var bMinPrice = util.getMinPriceService(b);
            console.log(aMinPrice + "  " + bMinPrice);
            if (aMinPrice > bMinPrice) return 1;
            else if (bMinPrice > aMinPrice) return -1;
            return 0;
          });
        }
      }

      return formatData;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  addToCart: async function (req) {
    try {
      const { serviceId, categoryType, priceType, quantity, slot } = req.body;

      var date = slot.date.split("/");
      slot.date = new Date(date[2], date[1] - 1, date[0]);

      const user = req.user;

      const userExist = await User.exists({ email: user.email });
      if (!userExist) return "User does not exist";

      const service = await ServiceModel.findOne({ _id: serviceId }).lean();
      if (!service) return "Service does not exist";
      var price = 0;
      service.prices.forEach((cat) => {
        if (cat.category == categoryType) {
          cat.prices.forEach((prices) => {
            if (prices.title == priceType) {
              price = prices.amount;
            }
          });
        }
      });
      var slotAvailable = false;
      service.timeSlots.forEach((timeSlot) => {
        if (Number(timeSlot.date) == Number(slot.date)) {
          timeSlot.timeSlots.forEach((time) => {
            if (time.from == slot.from && time.to == slot.to) {
              slotAvailable = true;
              return;
            }
          });
        }
        if (slotAvailable) return;
      });

      if (!slotAvailable)
        return "Slot Not Available please select different slot";

      const cart = await Cart.findOne({
        userId: user.id,
        serviceId,
        category: categoryType,
        priceType: priceType,
      });
      if (!cart) {
        if (quantity > 0) {
          var addCart = new Cart({
            userId: user.id,
            serviceId,
            category: categoryType,
            priceType: priceType,
            amount: price,
            totalAmount: price * quantity,
            quantity: quantity,
            timeSlot: slot,
          });
          await addCart.save();
        }
      } else {
        if (cart.quantity + quantity <= 0) {
          await Cart.deleteOne({ _id: cart._id });
        } else {
          if (
            !(
              cart.timeSlot.date == slot.date &&
              cart.timeSlot.from == slot.from &&
              cart.timeSlot.to == slot.to
            ) &&
            slotAvailable
          ) {
            cart.timeSlot = slot;
          }

          cart.quantity = cart.quantity + quantity;
          cart.totalAmount += quantity * price;
          await cart.save();
        }
      }
      const updatedCart = await Cart.find({ userId: user.id })
        .populate({
          path: "serviceId",
          select: "title name description image",
        })
        .select({ userId: 0 })
        .lean();

      const formatCart = commonUtil.formatCart(updatedCart);

      return formatCart;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  getCart: async function (req) {
    try {
      const user = req.user;

      const userExist = await User.exists({ email: user.email });
      if (!userExist) return "User does not exist";

      const updatedCart = await Cart.find({ userId: user.id })
        .populate({
          path: "serviceId",
          select: "title name description image",
        })
        .select({ userId: 0 })
        .lean();

      const formatCart = commonUtil.formatCart(updatedCart);

      return formatCart;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  updateProfile: async function (req) {
    try {
      const user = req.user;
      console.log(req.params);
      const userExist = await User.exists({ email: user.email });
      if (!userExist) return "User does not exist";

      var { firstName, lastName, DOB, contactNo } = req.body;

      var date = DOB.split("/");
      DOB = new Date(date[2], date[1] - 1, date[0]);
      const profile = await Profile.findOne({ userId: user.id });
      var profileImage = {};
      console.log(
        path.join(__dirname, "../content/profile/" + req.file.filename)
      );
      if (req.file) {
        profileImage = {
          data: fs.readFileSync(
            path.join(__dirname, "../content/profile/" + req.file.filename)
          ),
          contentType: "image/png",
        };
      }

      var profSave = null;
      if (profile) {
        profile.firstName = firstName;
        profile.lastName = lastName;
        profile.DOB = DOB;
        profile.contactNo = contactNo;
        if (req.file) {
          profile.profileImage = profileImage;
        }
        profSave = await profile.save();
      } else {
        var profObj = {
          firstName,
          lastName,
          DOB,
          contactNo,
          userId: user.id,
          profileImage: profileImage || undefined,
        };
        const profile = new Profile(profObj);
        profSave = await profile.save();
      }

      return profile;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  getProfile: async function (req) {
    try {
      const user = req.user;

      const userExist = await User.exists({ email: user.email });
      if (!userExist) return "User does not exist";

      var profile = await Profile.findOne({ userId: user.id })
        .select({ _id: 0 })
        .lean();
      if (!profile) {
        return {
          firstName: "",
          lastName: "",
          DOB: "",
          contactNo: "",
          email: user.email,
          profile: "",
        };
      }
      profile.emailId = user.email;
      return profile;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  getPreOrder: async function (req) {
    try {
      const user = req.user;

      const updatedCart = await Cart.find({ userId: user.id })
        .populate({
          path: "serviceId",
          select: "title name description image",
        })
        .select({ userId: 0 })
        .lean();

      const formatCart = commonUtil.formatCart(updatedCart);

      return formatCart;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  placeOrder: async function (req) {
    try {
      const user = req.user;
      const updatedCart = await Cart.find({ userId: user.id })
        .populate({
          path: "serviceId",
          select: "title name description image",
        })
        .select({ userId: 0 })
        .lean();

      const cartItems = commonUtil.formatCart(updatedCart);
      var orders = [];
      cartItems.cartList.forEach((items) => {
        var order = {};
        order.userId = user.id;
        order.serviceId = items.serviceId;
        order.quantity = items.quantity;
        order.totalAmount = items.totalAmount;
        order.timeSlot = items.timeSlot;
        order.price = items.amount;
        order.orderStatus = "Confirm";
        order.transactionStatus = "Success";
        var orderModel = new Order(order);
        orders.push(orderModel);
      });
      var orderList = await Order.insertMany(orders);

      var cartEmpty = await Cart.deleteMany({ userId: user.id });

      return commonUtil.formatOrder(orderList);
    } catch (error) {
      console.log(error);
      return;
    }
  },
  myOrders: async function (req) {
    try {
      const user = req.user;

      const orderList = await Order.find({ userId: user.id })
        .populate({
          path: "serviceId",
          select: "title name description image",
        })
        .select({ userId: 0 })
        .lean();

      return commonUtil.formatMyOrders(orderList);
    } catch (error) {
      console.log(error);
      return;
    }
  },
  postReview: async function (req) {
    try {
      const { serviceId, rating, review } = req.body;
      const user = req.user;

      const userExist = await User.exists({ email: user.email });
      if (!userExist) return "User does not exist";

      const userVerified = await Order.exists({
        userId: user.id,
        serviceId: serviceId,
      });

      if (!userVerified) return "User not ordered this Service";

      const reviewModel = Review({
        userId: user.id,
        serviceId,
        rating,
        review,
      });

      const postReview = await reviewModel.save();

      return postReview;
    } catch (error) {
      console.log(error);
      return;
    }
  },
  getReview: async function (req) {
    try {
      const user = req.user;
      const serviceId = req.query.serviceId;

      const userExist = await User.exists({ email: user.email });
      if (!userExist) return "User does not exist";

      var filter = {};
      //if(serviceId) filter.serviceId = serviceId

      /*const reviewList = await Review.find(filter).populate({
                path: "serviceId",
                select: "title name description image"
            }).select({ "userId": 0, "createdAt": 0, "updatedAt": 0 }).lean()*/

      const match = serviceId
        ? { serviceId: ObjectId(serviceId) }
        : { userId: ObjectId(user.id) };

      const reviews = await Review.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "profiles",
            localField: "userId",
            foreignField: "userId",
            as: "userDetail",
          },
        },
        {
          $unwind: {
            path: "$userDetail",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service",
          },
        },
        {
          $unwind: {
            path: "$service",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            rating: 1,
            review: 1,
            "userDetail.firstName": 1,
            "userDetail.lastName": 1,
            "service._id": 1,
            "service.title": 1,
            "service.name": 1,
            "service.description": 1,
            "service.image": 1,
            createdAt: 1,
          },
        },
      ]);
      // return reviews;
      return commonUtil.reviewFormatData(reviews);
    } catch (error) {
      console.log(error);
      return;
    }
  },
};

module.exports = userService;
