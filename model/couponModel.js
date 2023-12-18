const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: String,
  code: String,
  discount: Number,
  startingDate: Date,
  expiryDate: Date,
  totalCount: Number,
  active: {
    type: Boolean,
    default: true,
  },
});

const couponModel = mongoose.model("Coupon",couponSchema)

module.exports=couponModel
