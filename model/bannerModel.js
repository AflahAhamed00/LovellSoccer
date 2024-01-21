const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    image: String,
    description: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timeStamps: true }
);

const bannerModel = mongoose.model('banner',bannerSchema)

module.exports = bannerModel
