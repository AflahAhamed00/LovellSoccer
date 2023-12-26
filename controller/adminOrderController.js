const orderModel = require("../model/orderModel");
const productModel = require('../model/productModel')
const moment = require('moment')

const showAdminOrderPage = async (req, res) => {
  try {
    const orderList = await orderModel.find()
    .populate("customer", "name email")
    .populate("couponUsed", "name")
    res.render("admin/orders", {
      documentTitle: "Order Management",
      session: req.session.admin,
      orders: orderList,
      moment
    });
  } catch (err) {
    console.log("admin order details page rendering error - ", err);
    res.redirect("/admin/login");
  }
};

module.exports = {showAdminOrderPage}
