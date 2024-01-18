const mongoose = require("mongoose");
const productCollection = require("../model/productModel");
const userCollection = require('../model/userModel')

const wishlistSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: userCollection,
  },
  products: [
    {
     name: {
        type: mongoose.Types.ObjectId,
        ref: productCollection,
      },
      size:Number,
      stock:Number
    }
  ],
});

const wishlistModel = mongoose.model("Wishlist", wishlistSchema);

module.exports = wishlistModel;
