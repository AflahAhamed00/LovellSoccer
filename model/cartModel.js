const mongoose = require("mongoose");
const productCollection = require("../model/productModel");
const userCollection = require('../model/userModel')


const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: userCollection,
  },
  totalPrice: Number,
  totalQuantity:{
    type:Number,
    default:0
  },
  totalAfterDiscount: Number,
  products: [
    {
      name: {
        type: mongoose.Types.ObjectId,
        ref: productCollection,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      price: Number,
      productSize:Number,
      productStock:Number
    },
  ],
});

const cartModel =  mongoose.model("Cart", cartSchema);

module.exports = cartModel;
