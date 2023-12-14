const mongoose = require("mongoose");
const brandCollection = require("../model/brandModel");
const categoryCollection = require("../model/categoryModel");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    ref: categoryCollection,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  brand: {
    type: mongoose.Types.ObjectId,
    ref: brandCollection,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  sizeAndStock: [
    {
      size: {
        type: Number,
        required: true,
      },
      stock: {
        type: Number,
        required: true,
      },
    },
  ],
  thumbnail: {
    type: String,
    require,
  },
  frontImage: {
    type: String,
    require,
  },
  listed: {
    type: Boolean,
    default: true,
  },
  images: [String],
});

const productCollection = mongoose.model("productCollection", productSchema);

module.exports = productCollection;
