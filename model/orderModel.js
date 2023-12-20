const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const couponModel = require("../model/couponModel");

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: userModel,
  },
  shippingAddress: {
    building: String,
    mobileNumber: Number,
    pinCode: Number,
    city: String,
    state: String,
    address: String,
  },
  paymentMethod: String,
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
    default: Date.now(),
  },
  deliveredOn: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    default: "In-transit",
  },
});

const orderModel = mongoose.model('Orders',orderSchema)

module.exports = orderModel
