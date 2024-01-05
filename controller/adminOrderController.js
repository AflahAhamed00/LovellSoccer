const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");
const moment = require("moment");

const showAdminOrderPage = async (req, res) => {
  try {
    const orderList = await orderModel
      .find()
      .populate("customer", "name email")
      .populate("couponUsed", "name")
      .populate("summary.product", "category brand name price");
    res.render("admin/orders", {
      documentTitle: "Order Management",
      session: req.session.admin,
      orders: orderList,
      moment,
    });
  } catch (err) {
    console.log("admin order details page rendering error - ", err);
    res.redirect("/admin/login");
  }
};

const orderDetails = async (req, res) => {
  try {
    const currentOrder = await orderModel
      .findById(req.params.id)
      .populate("summary.product",)
      .populate("size")
      .populate("couponUsed");
    res.render("admin/orderDetails", {
      session: req.session.admin,
      currentOrder,
      moment,
      documentTitle: "Order Details",
    });
  } catch (err) {
    console.log("error in loading order details page - ", err);
    console.log("/admin/orders");
  }
};

module.exports = { showAdminOrderPage, orderDetails };
