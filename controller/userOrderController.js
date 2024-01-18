const orderModel = require("../model/orderModel");
const userModel = require("../model/userModel");
const cartModel = require("../model/cartModel");
const brandModel = require("../model/brandModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const moment = require("moment");
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose");
const couponModel = require("../model/couponModel");
const wishlistModel = require("../model/wishlistModel");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    const orderDate = Date.now(); // 'this' refers to the order document

    // Example: Deliver in 5 business days (excluding weekends)
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5);

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
      size: [],
      couponUsed: couponId,
      deliveredOn: deliveryDate,
      totalQuantity: userCart.totalQuantity,
      price: userCart.totalPrice,
      finalPrice: finalPrice,
      discountPrice: req.body.discountAmount,
    };

    userCart.products.forEach((product) => {
      orderDetails.size.push({ productSize: product.productSize });
    });

    req.session.orderDetails = orderDetails;

    const transactionID = Math.floor(
      Math.random() * (1000000000000 - 10000000000) + 10000000000
    );
    req.session.transactionID = transactionID;

    if (req.session.transactionID) {
      const couponUsed = req.session.couponUsed;
      req.session.transactionID = false;
      const orderDetails = new orderModel(req.session.orderDetails);
      await orderDetails.save();

      // decrementing stock after order is placed
      let productId;
      let productSize;
      let productQuantity;

      for (const item of userCart.products) {
        productId = item.name;
        productSize = item.productSize;
        productQuantity = item.quantity;
        console.log(productQuantity);

        const decrementStock = await productModel.findOneAndUpdate(
          {
            _id: productId,
          },
          {
            $inc: { "sizeAndStock.$[elem].stock": -productQuantity },
          },
          {
            arrayFilters: [{ "elem.size": productSize }],
          }
        );
      }

      // decrementing stock after order is placed completed
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
      } else {
        let order = orderDetails._id;
        var options = {
          amount: finalPrice * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + order,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log("error in razorpay - ", err);
          } else {
            res.send({ options });
          }
        });
      }
    }
  } catch (err) {
    console.log("error in placing order - ", err);
  }
};

const verifyPayment = async (req, res) => {
  try {
    console.log("body ", req.body);
    res.json({ status: true });
  } catch (err) {
    console.log("error in online payment - ", err);
    res.redirect("/");
  }
};

const orderSuccess = async (req, res) => {
  try {
    let userData = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    let cart = 0;
    let wishlist = 0;
    if (req.session.userLoggedIn) {
      cartCount = await cartModel.find({ customer: userData._id });
      console.log("myCart : ", cartCount);
      if (
        cartCount &&
        cartCount.length > 0 &&
        cartCount[0].totalQuantity !== undefined
      ) {
        cart = cartCount[0].totalQuantity;
      }
      wishlistCount = await wishlistModel.aggregate([
        {
          $group: {
            _id: null,
            totalSize: {
              $sum: {
                $size: {
                  $ifNull: ["$products", []],
                },
              },
            },
          },
        },
      ]);
      if (
        wishlistCount &&
        wishlistCount.length > 0 &&
        wishlistCount[0].totalSize !== undefined
      ) {
        wishlist = parseInt(wishlistCount[0].totalSize);
      }
    }

    const brandList = await brandModel.find();
    const categoryList = await categoryModel.find();

    const sendVerifyMail = async (name, email) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.VERIFICATION_MAIL_ID,
          pass: process.env.VERIFICATION_MAIL_PASSWORD,
        },
      });

      // define the mail subject

      const mailOptions = {
        from: process.env.VERIFICATION_MAIL_ID,
        to: email,
        subject: "Order confirmation mail",
        text: `Hi ${name}, Your order has succesfully placed`,
      };

      // send the email

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(`Error in sending ` + error);
          return true;
        } else {
          console.log(`Email sent: ` + info.response);
          return false;
        }
      });
    };
    sendVerifyMail(userData.name, userData.email);

    res.render("user/orderSuccess", {
      userData,
      brand: brandList,
      categories: categoryList,
      cartCount: cart,
      wishlistCount: wishlist,
    });
  } catch (err) {
    console.log("error in showing the order success page - ", err);
  }
};

const viewOrders = async (req, res) => {
  try {
    let userData = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    let cart = 0;
    let wishlist = 0;
    if (req.session.userLoggedIn) {
      cartCount = await cartModel.find({ customer: userData._id });
      console.log("myCart : ", cartCount);
      if (
        cartCount &&
        cartCount.length > 0 &&
        cartCount[0].totalQuantity !== undefined
      ) {
        cart = cartCount[0].totalQuantity;
      }
      wishlistCount = await wishlistModel.aggregate([
        {
          $group: {
            _id: null,
            totalSize: {
              $sum: {
                $size: {
                  $ifNull: ["$products", []],
                },
              },
            },
          },
        },
      ]);
      if (
        wishlistCount &&
        wishlistCount.length > 0 &&
        wishlistCount[0].totalSize !== undefined
      ) {
        wishlist = parseInt(wishlistCount[0].totalSize);
      }
    }

    const brandList = await brandModel.find();
    const categoryList = await categoryModel.find();

    let currentOrderedProducts = await orderModel
      .find({ customer: userData._id })
      .sort({ orderedOn: -1 })
      .populate("summary.product");
    currentOrderedProducts = currentOrderedProducts[0];
    
    res.render("user/viewOrders", {
      userData,
      categories: categoryList,
      brand: brandList,
      cartCount: cart,
      wishlistCount: wishlist,
      orderedProduct: currentOrderedProducts,
    });
  } catch (err) {
    console.log("error showing orders - ", err);
  }
};

const cancelOrder = async (req, res) => {
  try {
    console.log("orderid - ", req.body.orderId);
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      $set: {
        status: "cancelled",
      },
    });

    res.json("cancelled");
  } catch (err) {
    console.log("error in canceling order- ", err);
    res.redirect("/user/viewOrders");
  }
};

module.exports = {
  placeOrder,
  orderSuccess,
  viewOrders,
  verifyPayment,
  cancelOrder,
};
