const brandModel = require("../model/brandModel");

const listBrand = async (req, res) => {
  try {
    const brandList = await brandModel.find();
    res.render("admin/brands", {
      documentTitle: "Brand Management",
      session: req.session.admin,
      details: brandList,
    });
  } catch (err) {
    console.log(`admin brand list page showing error- ${err}`);
    res.redirect("/admin/login");
  }
};

const addBrand = async (req, res) => {
  try {
    let inputBrand = req.body.brand;
    inputBrand = inputBrand.toUpperCase();
    const brand = await brandModel.findOne({ name: inputBrand });
    const brandList = await brandModel.find();
    if (brand) {
      res.render("admin/brands", {
        documentTitle: "Brand Management",
        session: req.admin.session,
        details: brandList,
        errorMessage: "Brand already exists",
      });
    } else {
      const data = new brandModel({
        name: inputBrand,
      });
      await brandModel.insertMany([data]);
      res.redirect("/admin/brands");
    }
  } catch (err) {
    console.log(`admin brand adding error- ${err}`);
    res.redirect("/admin/login");
  }
};

const showEditBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const currentBrand = await brandModel.findById(brandId);
    req.session.currentBrand = currentBrand;
    res.render("admin/editBrand", {
      documentTitle: "Brand Management",
      session: req.session.admin,
      brand: currentBrand,
    });
  } catch (err) {
    console.log(`admin edit brand page showing error- ${err}`);
    res.redirect("/admin/login");
  }
};

const saveEditBrand = async (req, res) => {
  try {
    const currentBrand = req.session.currentBrand;
    let newBrand = req.body.name;
    const duplicationCheck = await brandModel.findOne({
      name: newBrand,
    });
    if (duplicationCheck) {
      res.render("admin/editBrand", {
        session: req.session.admin,
        documentTitle: "Edit Brand",
        errorMessage: "Duplication of brands not allowed",
        brand: null,
      });
    } else {
      await brandModel.updateOne(
        { _id: currentBrand._id },
        { $set: { name: newBrand } }
      );
      res.redirect("/admin/brands");
    }
  } catch (err) {
    console.log(`brand name editing error- ${err}`);
    res.redirect("/admin/login");
  }
};

module.exports = { listBrand, addBrand, showEditBrand, saveEditBrand };
