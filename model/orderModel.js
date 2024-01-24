const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const couponModel = require("../model/couponModel");
const productModel = require("../model/productModel");
const { bool } = require("sharp");

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: userModel,
  },
  summary: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: productModel,
      },
      quantity: Number,
      totalPrice: Number,
    },
  ],
  shippingAddress: {
    building: String,
    mobileNumber: Number,
    pinCode: Number,
    city: String,
    state: String,
    address: String,
  },
  paymentMethod: String,
  totalQuantity: Number,
  size: [
    {
      productSize: Number,
    },
  ],
  delivered: {
    type: Boolean,
    default: false,
  },
  couponUsed: {
    type: mongoose.Types.ObjectId,
    ref: couponModel,
  },
  orderedOn: {
    type: Date,
    default: () => new Date(),
  },
  deliveredOn: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    default: "In-transit",
  },
  price: Number,
  discountPrice: {
    type: Number,
    default: 0,
  },
  finalPrice: Number,
});

const orderModel = mongoose.model("Orders", orderSchema);

module.exports = orderModel;
