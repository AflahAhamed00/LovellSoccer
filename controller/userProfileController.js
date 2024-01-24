const cartModel = require("../model/cartModel");
const wishlistModel = require("../model/wishlistModel");
const brandModel = require("../model/brandModel");
const categoryModel = require("../model/categoryModel");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const orderModel = require("../model/orderModel");

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
      const user = await userModel.findById(userData._id);

      res.render("user/userProfile", {
        categories: category,
        brand,
        userData,
        user: user,
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

    res.redirect("/cart/proceedToPayment");
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
      const category = await categoryModel.find();
      const brand = await brandModel.find();
      res.render("user/adressPage", {
        categories: category,
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

const updateProfile = async (req, res) => {
  try {
    let userData = req.session.user;

    const updatedName = await userModel.findByIdAndUpdate(
      userData._id,
      {
        $set: {
          name: req.body.name,
        },
      },
      {
        new: true,
      }
    );
    res.json({ success: true, user: updatedName.name });
  } catch (err) {
    console.log("error in updateprofile - ", err);
  }
};

const updateEmailPhone = async (req, res) => {
  try {
    let userData = req.session.user;
    console.log("session details - ", userData);
    const updateEmailPhone = await userModel.findByIdAndUpdate(
      userData._id,
      {
        $set: {
          email: req.body.email.trim(),
          phoneNumber: req.body.phoneNumber.trim(),
        },
      },
      {
        new: true,
      }
    );
    res.json({ success: true, user: updateEmailPhone });
  } catch (err) {
    console.log("error in uodating email and phone - ", err);
  }
};

const updatePassword = async (req, res) => {
  try {
    console.log(req.body);
    let userData = req.session.user;
    const newHashedPassword = await bcrypt.hash(req.body.profilePassword, 10);
    await userModel.findByIdAndUpdate(userData._id, {
      $set: {
        password: newHashedPassword,
      },
    });

    res.send("success");
  } catch (err) {
    console.log("error in updating password - ", err);
  }
};

const getAddressEditingPage = async (req, res) => {
  try {
    if (req.session.user) {
      let cartCount = null;
      let wishlistCount = null;
      let cart = 0;
      let wishlist = 0;
      let userData = req.session.user;
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
      const category = await categoryModel.find();

      let addressId = req.params.id;
      const user = await userModel.findById(userData._id);
      const addressDetails = user.addresses.find(
        (addr) => addr._id.toString() === addressId
      );
      console.log("selected address - ", addressDetails);
      res.render("user/addressEditingPage", {
        addr: addressDetails,
        categories: category,
        cartCount: cart,
        wishlistCount: wishlist,
        userData,
      });
    }
  } catch (err) {
    console.log("error in showing edit address page - ", err);
  }
};

const updateAddress = async (req, res) => {
  try {
    console.log("updated address - ", req.body);
    let userData = req.session.user;
    let data = req.body.data;
    let mobileNumber = Number(data.mobileNumber);
    let alternativePhoneNumber = Number(data.alterMobile);
    let pinCode = Number(data.pinCode);
    let addressId = req.body.addressId;
    const updatedAddress = await userModel.findOneAndUpdate(
      {
        _id: userData._id,
        "addresses._id": new mongoose.Types.ObjectId(addressId),
      },
      {
        $set: {
          "addresses.$.building": data.building,
          "addresses.$.mobileNumber": mobileNumber,
          "addresses.$.pinCode": pinCode,
          "addresses.$.city": data.city,
          "addresses.$.state": data.state,
          "addresses.$.address": data.address,
          "addresses.$.alternativePhoneNumber": alternativePhoneNumber,
          "addresses.$.primary": true,
        },
      },
      { new: true }
    );
    res.json({ success: true, address: updatedAddress });
  } catch (err) {
    console.log("error in updating the address - ", err);
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (req.session.user) {
      let cartCount = null;
      let wishlistCount = null;
      let cart = 0;
      let wishlist = 0;
      let userData = req.session.user;
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

      const category = await categoryModel.find();
     
      const allOrders = await orderModel
        .find({ customer: userData._id })
        .populate("summary.product");
      res.render("user/allOrders", {
        orders: allOrders,
        userData,
        cartCount: cart,
        wishlistCount: wishlist,
        categories: category,
      });
    }
  } catch (err) {
    console.log("error in getting all orders - ", err);
    res.redirect('/')
  }
};

module.exports = {
  showUserProfilePage,
  showAdressPage,
  addAddress,
  updateProfile,
  updateEmailPhone,
  updatePassword,
  getAddressEditingPage,
  updateAddress,
  getAllOrders,
};
