const mongooose = require("mongoose");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const brandModel = require("../model/brandModel");
const sharp = require("sharp");

const viewProducts = async (req, res) => {
  try {
    const categoryList = await categoryModel.find({ isDeleted: false });
    const brandList = await brandModel.find({ isDeleted: false });
    const productList = await productModel
      .find()
      .populate(["category", "brand"]);
    res.render("admin/product", {
      session: req.session.admin,
      DocumentTitle: "Product Management",
      categories: categoryList,
      brands: brandList,
      products: productList,
    });
  } catch (err) {
    console.log("admin product page showing " + err);
    res.redirect("/admin/dashboard");
  }
};

const addProducts = async (req, res) => {
  try {
    
  } catch (err) {
    console.log("error in admin side add product " + err);
  }
};

module.exports = { viewProducts, addProducts };
