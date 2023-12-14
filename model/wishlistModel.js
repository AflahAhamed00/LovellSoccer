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
      type: mongoose.Types.ObjectId,
      ref: productCollection,
    },
  ],
});

const wishlistModel = mongoose.model("Wishlist", wishlistSchema);

module.exports = wishlistModel;
