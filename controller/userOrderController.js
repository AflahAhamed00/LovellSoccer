const orderModel = require("../model/orderModel");
const userModel = require("../model/userModel");
const cartModel = require("../model/cartModel");
const brandModel = require("../model/brandModel");
const categoryModel = require("../model/categoryModel");
const moment = require("moment");
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose");
const couponModel = require("../model/couponModel");

const placeOrder = async (req, res) => {
  try {
    console.log("available post data - ", req.body);
    if (req.body.address == undefined) {
      return res.json({ noAddress: true });
    }
    let totalAmount = await cartModel.find({ customer: req.session.user._id });
    let finalPrice = totalAmount[0].totalPrice - req.body.discountAmount;

    let shippingAddress = await userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.session.user._id),
        },
      },
      {
        $unwind: "$addresses",
      },
      {
        $match: {
          "addresses._id": new mongoose.Types.ObjectId(req.body.address),
        },
      },
    ]);

    shippingAddress = shippingAddress[0].addresses;


    let couponUsed = await couponModel.findOne({
      code: req.body.coupon,
      active: true,
    });
    let couponId;

    if (couponUsed) {
      couponId = couponUsed._id;

      await couponModel.findByIdAndUpdate(couponUsed._id, {
        $inc: {
          totalCount: -1,
        },
      });
    } else {
      couponId = null;
    }

    req.session.couponUsed = couponUsed;

    const userCart = await cartModel.findOne({
      customer: req.session.user._id,
    });

    let orderDetails = {
      customer: req.session.user._id,
      shippingAddress: {
        building: shippingAddress.building,
        address: shippingAddress.address,
        pinCode: shippingAddress.pinCode,
        city: shippingAddress.city,
        mobileNumber: shippingAddress.mobileNumber,
      },
      modeOfPayment: req.body.paymentMethod,
      couponUsed: couponId,
      totalQuantity: userCart.totalQuantity,
      price: userCart.totalPrice,
      finalPrice: finalPrice,
      discountPrice: req.body.discountAmount,
    };

    

    req.session.orderDetails = orderDetails;

    const transactionID = Math.floor(
      Math.random() * (1000000000000 - 10000000000) + 10000000000
    );
    console.log('transaction id - ',transactionID);
    req.session.transactionID = transactionID;


    if (req.session.transactionID) {
      const couponUsed = req.session.couponUsed;
      req.session.transactionID = false;
      const orderDetails = new orderModel(req.session.orderDetails);
      console.log("order details - ", orderDetails);
      orderDetails.save();
    //   if (couponUsed) {
    //     await userModel.findByIdAndUpdate(req.session.user._id, {
    //       $push: {
    //         orders: [new mongoose.Types.ObjectId(orderDetails)],
    //         couponsUsed: [couponUsed],
    //       },
    //     });
    //   } else {
    //     await userModel.findByIdAndUpdate(req.session.user._id, {
    //       $push: {
    //         orders: [new mongoose.Types.ObjectId(orderDetails)],
    //       },
    //     });
    //   }

      await cartModel.findOneAndUpdate(
        {
          customer: req.session.user._id,
        },
        {
          $set: { products: [], totalPrice: 0, totalQuantity: 0 },
        }
      );

      if (req.body.paymentMethod == "COD") {
        res.json({ codSuccess: true });
      }
    }
  } catch (err) {
    console.log("error in placing order - ", err);
  }
};

module.exports = { placeOrder };
