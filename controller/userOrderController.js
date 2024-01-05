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

    let orderSummary = await cartModel.aggregate([
      {
        $match: {
          customer: new mongoose.Types.ObjectId(req.session.user._id),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          _id: 0,
          product: "$products.name",
          quantity: "$products.quantity",
          totalPrice: "$products.price",
        },
      },
    ]);

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

    const orderDate = Date.now() // 'this' refers to the order document

 // Example: Deliver in 5 business days (excluding weekends)
 const deliveryDate = new Date(orderDate);
 deliveryDate.setMinutes(deliveryDate.getMinutes() + 2);



    let orderDetails = {
      customer: req.session.user._id,
      summary: orderSummary,
      shippingAddress: {
        building: shippingAddress.building,
        address: shippingAddress.address,
        pinCode: shippingAddress.pinCode,
        state: shippingAddress.state,
        city: shippingAddress.city,
        mobileNumber: shippingAddress.mobileNumber,
      },
      paymentMethod: req.body.paymentMethod,
      size:[],
      couponUsed: couponId,
      deliveredOn:deliveryDate,
      totalQuantity: userCart.totalQuantity,
      price: userCart.totalPrice,
      finalPrice: finalPrice,
      discountPrice: req.body.discountAmount,
    };

    userCart.products.forEach((product) => {
      orderDetails.size.push({ productSize: product.productSize });
    });

    console.log('order details - ',orderDetails);
    req.session.orderDetails = orderDetails;

    const transactionID = Math.floor(
      Math.random() * (1000000000000 - 10000000000) + 10000000000
    );
    console.log("transaction id - ", transactionID);
    req.session.transactionID = transactionID;

    // if(deliveryDate> Date.now()){
    //   await orderModel.findOneAndUpdate({
    //     _id:_id,
    // },
    // {
    //   $set:{
    //     status:"Delivered"
    //   }
    // },
    // {
    //   new:true,
    // },
    // )
    //  }

    if (req.session.transactionID) {
      const couponUsed = req.session.couponUsed;
      req.session.transactionID = false;
      const orderDetails = new orderModel(req.session.orderDetails);
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
