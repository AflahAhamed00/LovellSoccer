const productModel = require("../model/productModel")
const categoryModel = require("../model/categoryModel")
const brandModel = require("../model/brandModel")

const showAllProducts = async(req,res)=>{
    try {
        const productList = await productModel.find({listed:true})
        res.render('user/allProducts',{
            product : productList
        })
    } catch (err) {
        console.log(`Error showing all products page- ${err}`);
        res.redirect('/')
    }
}

const singleProductDetails = async(req,res)=>{
    try {
        let productId = req.params.id
        const productDetails = await productModel.find({_id:productId})
        const category = await categoryModel.find()
        const brand = await brandModel.find()
        res.render('user/singleProductDetails',{
            productDetails,
            category,
            brand
        })
    } catch (err) {
        console.log(`Error in rendering single product detail page - ${err}`);
        res.redirect('/')
    }
}

module.exports = {showAllProducts,singleProductDetails}