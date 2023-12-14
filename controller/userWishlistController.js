const wishlistModel = require("../model/wishlistModel");
const cartModel = require("../model/cartModel")
const categoryModel = require("../model/categoryModel")
const brandModel = require("../model/brandModel")
const productModel = require("../model/productModel")

const showWishlistPage = async (req,res)=>{
    try {
        let cartCount = null
        let wishlistCount = null
        let cart = 0
        let wishlist = 0
        let userData = req.session.user
        if(req.session.userLoggedIn){
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

        let category = await categoryModel.find()
        let brand = await brandModel.find()
        let wishlistData = await wishlistModel.findOne({customer:userData._id}).populate("products")
        // console.log("wislist data - ",wishlistData);
        res.render('user/wishlist',{userData,cartCount:cart,wishlistCount:wishlist,category,brand,wishlist:wishlistData})
    } catch (err) {
        console.log('wishlist page showing error',err);
        res.redirect('/')
    }
} 

const addToWishlist = async (req,res)=>{
  try {
    if(req.session.user){
      const userWishlist = await wishlistModel.findOne({
        customer:req.session.user._id,
      })
      if(userWishlist){
        const product = await productModel.findById(req.body.productId)
        const productExist = await wishlistModel.findOne({
          _id:userWishlist._id,
          products:req.body.productId,
        })
        if(!productExist){
          await wishlistModel.findByIdAndUpdate(userWishlist._id,{
            $push:{
              products:[req.body.productId]
            },
          })
          res.send({
            status:true
          })
        }
        else{
          res.send({
            status:"alreadyExists"
          })
        }
      }
    }
    else{
      console.log("need to log in before accecssing wishlist");
    }
  } catch (err) {
    console.log('error in adding product to wishlist - ',err);
    res.redirect('/')
  }
}

const removeWishlistProduct = async(req,res)=>{
  try {
    const userWishlist = await wishlistModel.findOne({
      customer:req.session.user._id,
    })
    if(userWishlist){
      const productExist = await wishlistModel.updateOne(
        {
          _id:userWishlist._id,
        },
        {
          $pull:{
            products:req.body.id
          }
        }
      )
      res.send({
        status:"deleted"
      })
    }
  } catch (err) {
    console.log('deleting wishlist product error - ',err);
    res.redirect('/')
  }
}

module.exports ={showWishlistPage, addToWishlist, removeWishlistProduct}