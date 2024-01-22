const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const brandModel = require("../model/brandModel");
const cartModel = require("../model/cartModel");
const wishlistModel = require("../model/wishlistModel");

const showAllProducts = async (req, res) => {
  try {
    let userData = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    let cart = 0;
    let wishlist = 0;
    if (req.session.userLoggedIn) {
      cartCount = await cartModel.find({ customer: userData._id });
      if (
        cartCount &&
        cartCount.length > 0 &&
        cartCount[0].totalQuantity !== undefined
      ) {
        cart = cartCount[0].totalQuantity;
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
    const productList = await productModel
      .find({ listed: true })
      .populate("category brand");
    const brandList = await brandModel.find();
    const categoryList = await categoryModel.find();
    res.render("user/allProducts", {
      product: productList,
      brand: brandList,
      categories: categoryList,
      userData,
      cartCount: cart,
      wishlistCount: wishlist,
    });
  } catch (err) {
    console.log(`Error showing all products page- ${err}`);
    res.redirect("/");
  }
};

const brandBasedProducts = async (req, res) => {
  try {
    let userData = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    let cart = 0;
    let wishlist = 0;
    if (req.session.userLoggedIn) {
      cartCount = await cartModel.find({ customer: userData._id });
      if (
        cartCount &&
        cartCount.length > 0 &&
        cartCount[0].totalQuantity !== undefined
      ) {
        cart = cartCount[0].totalQuantity;
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

    const brandList = await brandModel.find();
    const categoryList = await categoryModel.find();

    let brandId = req.params.id;
    const productList = await productModel.find({
      brand: brandId,
      listed: true,
    });
    res.render("user/brandBasedProducts", {
      product: productList,
      brand: brandList,
      categories: categoryList,
      userData,
      cartCount: cart,
      wishlistCount: wishlist,
    });
  } catch (err) {
    console.log("error in showing products based on the brands - ", err);
  }
};

const categoryBasedProducts = async (req, res) => {
  try {
    let userData = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    let cart = 0;
    let wishlist = 0;
    if (req.session.userLoggedIn) {
      cartCount = await cartModel.find({ customer: userData._id });
      if (
        cartCount &&
        cartCount.length > 0 &&
        cartCount[0].totalQuantity !== undefined
      ) {
        cart = cartCount[0].totalQuantity;
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

    const brandList = await brandModel.find();
    const categoryList = await categoryModel.find();

    let categoryId = req.params.id;
    const productList = await productModel.find({
      category: categoryId,
      listed: true,
    });
    res.render("user/brandBasedProducts", {
      product: productList,
      brand: brandList,
      categories: categoryList,
      userData,
      cartCount: cart,
      wishlistCount: wishlist,
    });
  } catch (err) {
    console.log("error in showing products based on the brands - ", err);
  }
};

const sortBy = async (req, res) => {
  try {
    req.session.listing = await productModel.find({ listed: true });
    if (req.body.sortBy == "ascending") {
      let products = await productModel
        .find({ listed: true })
        .sort({ price: 1 });
      res.send({ products });
    } else if (req.body.sortBy == "descending") {
      let products = await productModel
        .find({ listed: true })
        .sort({ price: -1 });
      res.send({ products });
    }
  } catch (err) {
    console.log("error in sorting - ", err);
    res.redirect("/");
  }
};

const filterProducts = async (req, res) => {
  try {
    const filterObject = {};
    let brandFilter = req.body.brandFilter || [];
    let categoryFilter = req.body.categoryFilter || [];
    let sizeFilter = req.body.sizeFilter || [];

    if (brandFilter.length > 0) {
      filterObject.brand = { $in: brandFilter };
    }
    if (categoryFilter.length > 0) {
      filterObject.category = { $in: categoryFilter };
    }
    if (sizeFilter.length > 0) {
      filterObject.sizeAndStock = { $elemMatch: { size: { $in: sizeFilter } } };
    }
    filterObject.listed = true;
    // Fetch products using filters
    const products = await productModel.find(filterObject);

    res.send({ products });
  } catch (err) {
    console.log("error in filtering products - ", err);
  }
};

const singleProductDetails = async (req, res) => {
  try {
    let productId = req.params.id;
    let userData = req.session.user;
    let cartCount = 0;
    let wishlistCount = 0;

    if (req.session.userLoggedIn) {
      const cartData = await cartModel.findOne({ customer: userData._id });
      if (cartData && cartData.totalQuantity !== undefined) {
        cartCount = cartData.totalQuantity;
      }

      const wishlistData = await wishlistModel.findOne({
        customer: userData._id,
      });

      if (wishlistData && wishlistData.products) {
        wishlistCount = wishlistData.products.length;
      }
    }

    const productDetails = await productModel.find({ _id: productId });
    const category = await categoryModel.find();
    const brand = await brandModel.find();

    res.render("user/singleProductDetails", {
      userData,
      cartCount,
      wishlistCount,
      productDetails,
      categories: category,
      brand,
    });
  } catch (err) {
    console.log(`Error in rendering single product detail page - ${err}`);
    res.redirect("/");
  }
};

const getSearchProduct = async (req, res) => {
  try {
    let userData = req.session.user;
    let cartCount = null;
    let wishlistCount = null;
    let cart = 0;
    let wishlist = 0;
    if (req.session.userLoggedIn) {
      cartCount = await cartModel.find({ customer: userData._id });
      if (
        cartCount &&
        cartCount.length > 0 &&
        cartCount[0].totalQuantity !== undefined
      ) {
        cart = cartCount[0].totalQuantity;
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

    const categoryList = await categoryModel.find();

    const searchedData = req.query.search;
    const searchProduct = await productModel.find({
      name: { $regex: new RegExp(searchedData, "i") },
      listed:true,
    });
  
    res.render("user/searchProducts", {
      product: searchProduct,
      categories: categoryList,
      userData,
      cartCount: cart,
      wishlistCount: wishlist,
    });
  } catch (err) {
    console.log("error in searching products - ", err);
    res.redirect('/')
  }
};

module.exports = {
  showAllProducts,
  brandBasedProducts,
  categoryBasedProducts,
  sortBy,
  filterProducts,
  singleProductDetails,
  getSearchProduct
};
