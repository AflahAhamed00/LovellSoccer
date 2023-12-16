const cartModel = require("../model/cartModel");
const wishlistModel = require("../model/wishlistModel");
const brandModel = require("../model/brandModel");
const categoryModel = require("../model/categoryModel");
const userModel = require("../model/userModel");

const showUserProfilePage = async (req, res) => {
  try {
    if (req.session.user) {
      let cartCount = null;
      let wishlistCount = null;
      let cart = 0;
      let wishlist = 0;
      let userData = req.session.user;
      let cartProducts = await cartModel
        .findOne({ customer: userData._id })
        .populate("products.name");
      if (req.session.userLoggedIn) {
        cartCount = await cartModel.findOne({ customer: userData._id });
        if (cartCount && cartCount.totalQuantity !== undefined) {
          cart = cartCount.totalQuantity;
        }
        wishlistCount = await wishlistModel.aggregate([
          {
            $group: {
              _id: null,
              totalSize: {
                $sum: {
                  $size: {
                    $ifNull: ["$products", []],
                  },
                },
              },
            },
          },
        ]);
        if (
          wishlistCount &&
          wishlistCount.length > 0 &&
          wishlistCount[0].totalSize !== undefined
        ) {
          wishlist = parseInt(wishlistCount[0].totalSize);
        }
      }
      let totalAmount = await cartModel.find({ customer: userData._id });
      let totalPrice = totalAmount.totalPrice;
      const category = await categoryModel.find();
      const brand = await brandModel.find();
      // const user = await userModel.find()
      res.render("user/userProfile", {
        category,
        brand,
        userData,
        cartProducts,
        cartCount: cart,
        wishlistCount: wishlist,
        totalAmount: totalPrice,
      });
    }
  } catch (err) {
    console.log("showing user profile page error - ", err);
    res.redirect("/");
  }
};

const addAddress = async (req, res) => {
  try {
    let userData = req.session.user;
    let user = await userModel.findOne({ _id: userData._id });
    if (user) {
      await userModel.updateOne(
        {
          _id: userData._id,
        },
        {
          $push: {
            addresses: {
              building: req.body.building,
              mobileNumber: req.body.mobileNumber,
              pinCode: req.body.pinCode,
              city: req.body.city,
              state: req.body.state,
              address: req.body.address,
              alternativePhoneNumber: req.body.alterMobile,
              primary: true,
            },
          },
        }
      );
    }

    res.redirect('/cart/proceedToPayment')
  } catch (err) {
    console.log("error in adding address - ", err);
  }
};

const showAdressPage = async (req, res) => {
  try {
    if (req.session.user) {
      let cartCount = null;
      let wishlistCount = null;
      let cart = 0;
      let wishlist = 0;
      let userData = req.session.user;
      // let cartProducts = await cartModel
      //   .findOne({ customer: userData._id })
      //   .populate("products.name");
      if (req.session.userLoggedIn) {
        cartCount = await cartModel.findOne({ customer: userData._id });
        if (cartCount && cartCount.totalQuantity !== undefined) {
          cart = cartCount.totalQuantity;
        }
        wishlistCount = await wishlistModel.aggregate([
          {
            $group: {
              _id: null,
              totalSize: {
                $sum: {
                  $size: {
                    $ifNull: ["$products", []],
                  },
                },
              },
            },
          },
        ]);
        if (
          wishlistCount &&
          wishlistCount.length > 0 &&
          wishlistCount[0].totalSize !== undefined
        ) {
          wishlist = parseInt(wishlistCount[0].totalSize);
        }
      }
      // let totalAmount = await cartModel.find({ customer: userData._id });
      // let totalPrice = totalAmount.totalPrice;
      const category = await categoryModel.find();
      const brand = await brandModel.find();
      res.render("user/adressPage", {
        category,
        brand,
        userData,
        cartCount: cart,
        wishlistCount: wishlist,
      });
    }
  } catch (err) {
    console.log("adress page showing error - ", err);
  }
};

module.exports = { showUserProfilePage, showAdressPage, addAddress };
