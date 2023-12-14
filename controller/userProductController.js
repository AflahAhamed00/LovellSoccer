const productModel = require("../model/productModel")
const categoryModel = require("../model/categoryModel")
const brandModel = require("../model/brandModel")
const cartModel = require("../model/cartModel")
const wishlistModel = require("../model/wishlistModel")

const showAllProducts = async(req,res)=>{
    try {
        let userData = req.session.user
    let cartCount = null;
    let wishlistCount = null;
    let cart=0;
    let wishlist = 0;
    if (req.session.userLoggedIn) {
      cartCount = await cartModel.find({customer:userData._id})
      console.log('myCart : ',cartCount);
      if (cartCount && cartCount.length > 0 && cartCount[0].totalQuantity !== undefined){
        cart=cartCount[0].totalQuantity;
      }
      wishlistCount = await wishlistModel.aggregate([
        {
          $group: {
            _id: null,
            totalSize: {
              $sum: {
                $size:{
                  $ifNull: ["$products", []],
                },
              },
            },
          },
        },
      ]);
      if (wishlistCount && wishlistCount.length > 0 && wishlistCount[0].totalSize !== undefined) {
        wishlist = parseInt(wishlistCount[0].totalSize);
      }
    }
        const productList = await productModel.find({listed:true})
        res.render('user/allProducts',{
            product : productList,
            userData,
            cartCount:cart,
            wishlistCount:wishlist
        })
    } catch (err) {
        console.log(`Error showing all products page- ${err}`);
        res.redirect('/')
    }
}


const sortBy = async (req,res) =>{
  try {
    req.session.listing = await productModel.find({listed:true})
    if(req.body.sortBy == 'ascending'){
      let products = await productModel.find({listed:true}).sort({price:1})

      res.send({products})
    }
    else if(req.body.sortBy == 'descending'){
      let products = await productModel.find({listed:true}).sort({price:-1})

      res.send({products})
    }
  } catch (err) {
    console.log('error in sorting - ',err);
    res.redirect('/')
  }
}

const singleProductDetails = async(req,res)=>{
    try {
        let productId = req.params.id
        let cartCount = null
        let wishlistCount = null
        let cart = 0
        let wishlist = 0
        let userData = req.session.user
        if(req.session.userLoggedIn){
            cartCount = await cartModel.findOne({customer:userData._id})
            if (cartCount && cartCount.length > 0 && cartCount[0].totalQuantity !== undefined){
                cart=cartCount[0].totalQuantity;
              }
              wishlistCount = await wishlistModel.aggregate([
                {
                  $group: {
                    _id: null,
                    totalSize: {
                      $sum: {
                        $size:{
                          $ifNull: ["$products", []],
                        },
                      },
                    },
                  },
                },
              ]);
              if (wishlistCount && wishlistCount.length > 0 && wishlistCount[0].totalSize !== undefined) {
                wishlist = parseInt(wishlistCount[0].totalSize);
              }
        }
        const productDetails = await productModel.find({_id:productId})
        const category = await categoryModel.find()
        const brand = await brandModel.find()
        res.render('user/singleProductDetails',{
            userData,
            cartCount:cart,
            wishlistCount:wishlist,
            productDetails,
            category,
            brand
        })
    } catch (err) {
        console.log(`Error in rendering single product detail page - ${err}`);
        res.redirect('/')
    }
}

module.exports = {showAllProducts, sortBy, singleProductDetails}