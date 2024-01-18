const Toastify = require("toastify-js");
const cartModel = require("../model/cartModel");
const categoryModel = require("../model/categoryModel");
const brandModel = require("../model/brandModel");
const productModel = require("../model/productModel");
const wishlistModel = require("../model/wishlistModel");
const userModel = require("../model/userModel");
const couponModel = require("../model/couponModel");
const { default: mongoose } = require("mongoose");
const { name } = require("ejs");

const addToCart = async (req, res) => {
  try {
    if (req.session.user && req.session.user._id) {
      let userData = req.session.user;
      let productId = req.body.productId;
      let selectedSize = req.body.size;
      console.log(productId);
      console.log(selectedSize);

      productId = productId.trim();

      const wishlistCheck = await wishlistModel.findOne({
        customer: userData._id,
      });
      if (wishlistCheck && wishlistCheck._id) {
        const productIdToRemoveFromWishlist = new mongoose.Types.ObjectId(
          productId
        );
        await wishlistModel.findByIdAndUpdate(
          wishlistCheck._id,
          {
            $pull: {
              products: {
                name: productIdToRemoveFromWishlist,
              },
            },
          },
          { new: true }
        );
      }

      const userCart = await cartModel.findOne({
        customer: userData._id,
      });
      const product = await productModel.findById(productId);

      const [sizeAndStockEntry] = product.sizeAndStock.filter((item) => {
        if (item.size == selectedSize) {
          return item;
        }
      });
      let size = sizeAndStockEntry.size;
      let stock = sizeAndStockEntry.stock;

      if (stock > 0) {
        const productExist = await cartModel.findOne({
          _id: userCart._id,
          products: {
            $elemMatch: { name: new mongoose.Types.ObjectId(productId) },
          },
        });

        if (productExist) {
          const productSizeExist = await cartModel.findOne({
            _id: userCart._id,
            products: {
              $elemMatch: {
                name: new mongoose.Types.ObjectId(productId),
                productSize: size,
              },
            },
          });
          if (productSizeExist) {
            console.log("size exists");
            await cartModel.updateOne(
              {
                _id: userCart._id,
                products: {
                  $elemMatch: {
                    name: new mongoose.Types.ObjectId(productId),
                    productSize: size,
                  },
                },
              },
              {
                $inc: {
                  "products.$.quantity": 1,
                  totalPrice: product.price,
                  totalQuantity: 1,
                  "products.$.price": product.price,
                },
              }
            );
            res.json({
              status: "countAdded",
            });
          } else {
            await cartModel.findByIdAndUpdate(userCart._id, {
              $push: {
                products: [
                  {
                    name: new mongoose.Types.ObjectId(productId),
                    price: product.price,
                    productSize: size,
                    productStock: stock,
                  },
                ],
              },
              $inc: {
                totalPrice: product.price,
                totalQuantity: 1,
              },
            });
            console.log("same product different size added");
            res.send({
              status: "addedToCart",
              Toastify,
            });
          }
        } else {
          await cartModel.findByIdAndUpdate(userCart._id, {
            $push: {
              products: [
                {
                  name: new mongoose.Types.ObjectId(productId),
                  price: product.price,
                  productSize: size,
                  productStock: stock,
                },
              ],
            },
            $inc: {
              totalPrice: product.price,
              totalQuantity: 1,
            },
          });
          res.send({
            status: "addedToCart",
          });
        }
      } else {
        res.send({
          status: "outOfStock",
        });
      }
    } else {
      res.send({
        status: false,
      });
    }
  } catch (err) {
    console.log("adding product to cart error - " + err);
    res.redirect("/");
  }
};

const showCart = async (req, res) => {
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
      res.render("user/cart", {
        categories: category,
        brand,
        userData,
        cartProducts,
        cartCount: cart,
        wishlistCount: wishlist,
        totalAmount: totalPrice,
      });
    } else {
      console.log("Need to login first");
      res.redirect("/userLogin");
    }
  } catch (err) {
    console.log(`Error in showing cart page - ${err}`);
    res.redirect("/");
  }
};

const removeCartProduct = async (req, res) => {
  try {
    if (req.session.user) {
      let size = parseInt(req.body.size, 10);
      let productFromCart = await cartModel.aggregate([
        {
          $match: {
            customer: new mongoose.Types.ObjectId(req.session.user._id),
          },
        },
        {
          $unwind: "$products",
        },
        {
          $match: {
            "products.name": new mongoose.Types.ObjectId(req.body.id),
            "products.productSize": size,
          },
        },
      ]);
      const cartID = productFromCart[0]._id;
      productFromCart = productFromCart[0].products;
      await cartModel.findByIdAndUpdate(cartID, {
        $pull: {
          products: {
            name: req.body.id,
            productSize: size,
          },
        },
        $inc: {
          totalPrice: -productFromCart.price,
          totalQuantity: -productFromCart.quantity,
        },
      });
      res.json({
        success: "removed",
      });
    } else {
      console.log("Need to login first");
      res.redirect("/");
    }
  } catch (err) {
    console.log("removing cart product error - ", err);
  }
};

const addCount = async (req, res) => {
  try {
    console.log("adding count");
    if (req.session.user) {
      const product = await productModel.findById(req.body.product);
      let size = parseInt(req.body.size, 10);
      const userCart = await cartModel.findOne({
        customer: req.session.user._id,
      });

      const count = await cartModel.findOneAndUpdate(
        {
          _id: userCart._id,
          customer: req.session.user._id,
          products: {
            $elemMatch: { name: req.body.product, productSize: size },
          },
        },
        {
          $inc: {
            "products.$.quantity": 1,
            "products.$.price": product.price,
            totalPrice: product.price,
            totalQuantity: 1,
          },
        }
      );
      res.json({
        userCart,
      });
    } else {
      console.log("Need to login first");
      res.redirect("/");
    }
  } catch (err) {
    console.log("error in adding count in cart" + err);
    res.redirect("/");
  }
};

const reduceCount = async (req, res) => {
  try {
    console.log("reducing count");
    if (req.session.user) {
      console.log(req.body.size);
      const product = await productModel.findById(req.body.product);
      let size = parseInt(req.body.size, 10);
      const currentItem = await cartModel.aggregate([
        {
          $match: {
            customer: new mongoose.Types.ObjectId(req.session.user._id),
          },
        },
        {
          $unwind: "$products",
        },
        {
          $match: {
            "products.name": product._id,
            "products.productSize": size,
          },
        },
      ]);

      const totalQtyPerItem = currentItem[0].totalQuantity;
      if (totalQtyPerItem > 1) {
        const count = await cartModel.findOneAndUpdate(
          {
            _id: currentItem[0]._id,
            products: {
              $elemMatch: {
                name: new mongoose.Types.ObjectId(req.body.product),
                productSize: size,
              },
            },
          },
          {
            $inc: {
              "products.$.quantity": -1,
              totalPrice: -product.price,
              "products.$.price": -product.price,
              totalQuantity: -1,
            },
          }
        );

        const userCart = await cartModel.findOne({
          customer: req.session.user._id,
        });
        res.json({
          userCart,
          removedProduct: false,
        });
      }
      if (totalQtyPerItem == 1) {
        await cartModel.findOneAndUpdate(
          {
            _id: currentItem[0]._id,
            "products.name": new mongoose.Types.ObjectId(req.body.product),
            "products.productSize": size,
          },
          {
            $inc: {
              "products.$.quantity": -1,
              totalPrice: -product.price,
              "products.$.price": -product.price,
              totalQuantity: -1,
            },
          }
        );

        const userCart = await cartModel.findOne({
          customer: req.session.user._id,
        });
        res.json({
          userCart,
          removedProduct: true,
        });
      }
    }
  } catch (err) {
    console.log("error in reducing the cart product count" + err);
    res.redirect("/");
  }
};

const proceedToPayment = async (req, res) => {
  try {
    if (req.session.user) {
      let wishlistCount = null;
      let cartCount = null;
      let cart = 0;
      let wishlist = 0;
      let userData = req.session.user;
      let cartProducts = await cartModel
        .findOne({ customer: userData._id })
        .populate("products.name");
      cartCount = await cartModel.findOne({ customer: userData._id });
      if (cartCount.totalQuantity > 0) {
        if (req.session.userLoggedIn) {
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
        const coupon = await couponModel.find({ active: true });
        let user = await userModel.findOne(
          {
            _id: userData._id,
          },
          {
            addresses: 1,
          }
        );
        res.render("user/checkout", {
          categories: category,
          brand,
          coupon,
          userData,
          user,
          cartCount: cart,
          wishlistCount: wishlist,
          cartProducts,
          totalAmount: totalPrice,
        });
      } else {
        res.redirect("/");
      }
    }
  } catch (err) {
    console.log("proceed to payment rendring page error - ", err);
  }
};

module.exports = {
  showCart,
  addToCart,
  addCount,
  reduceCount,
  removeCartProduct,
  proceedToPayment,
};
