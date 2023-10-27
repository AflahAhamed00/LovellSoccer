const mongooose = require("mongoose");
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const brandModel = require("../model/brandModel");
const sharp = require("sharp");

const viewProducts = async (req, res) => {
  try {
    const categoryList = await categoryModel.find();
    const brandList = await brandModel.find();
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
    let frontImage = `${req.body.name}_front_image_${Date.now()}.png`
    sharp(req.files.frontImage[0].buffer)
    .toFormat('png')
    .png({quality:80})
    .toFile(`public/img/products/${frontImage}`)
    req.body.frontImage = frontImage
    let thumbnail = `${req.body.name}_thumbnail_${Date.now()}.png`
    sharp(req.files.thumbnail[0].buffer)
    .toFormat('png')
    .png({quality:80})
    .toFile(`public/img/products/${thumbnail}`)
    req.body.thumbnail = thumbnail
    const newImages = []
    for(i=0;i<3;i++){
     let imageName = `${req.body.name}_image${i+1}_${Date.now()}.png`
     sharp(req.files.images[i].buffer)
     .toFormat('png')
     .png({quality:80})
     .toFile(`public/img/products/${imageName}`)
     newImages.push(imageName)
    }
    req.body.images = newImages

    req.body.category = new mongooose.Types.ObjectId(req.body.category)
    req.body.brand =  new mongooose.Types.ObjectId(req.body.brand)

    const newProduct = new productModel({
      name:req.body.name,
      category:req.body.category,
      brand:req.body.brand,
      description:req.body.description,
      price:req.body.price,
      stock:req.body.stock,
      size:req.body.size,
      type:req.body.type,
      thumbnail:req.body.thumbnail,
      frontImage:req.body.frontImage,
      images:req.body.images,
    })

    await productModel.insertMany([newProduct])
    console.log("product added succesfully");
    res.redirect("/admin/productManagement")
  } catch (err) {
    console.log("error in admin side add product " + err);
  }
};

module.exports = { viewProducts, addProducts };
