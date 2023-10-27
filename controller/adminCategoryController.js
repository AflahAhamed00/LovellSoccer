const { default: mongoose } = require("mongoose");
const categoryModel = require("../model/categoryModel");

const listCategory = async (req, res) => {
  try {
    const categoryList = await categoryModel.find();
    res.render("admin/categories", {
      documentTitle: "Category Management",
      session: req.session.admin,
      details: categoryList,
    });
  } catch (err) {
    console.log(`Admin Category landing page ${err} `);
    res.redirect("/admin/login");
  }
};

const addCategory = async (req, res) => {
  try {
    let inputCategory = req.body.category;
    inputCategory = inputCategory.toUpperCase();
    const category = await categoryModel.findOne({ name: inputCategory });
    const categoryList = await categoryModel.find();
    if (category) {
      res.render("admin/categories", {
        documentTitle: "Category Management",
        session: req.session.admin,
        details: categoryList,
        errorMessage: "Category already exist",
      });
    } else {
      const data = new categoryModel({
        name: inputCategory,
      });
      await categoryModel.insertMany([data]);
      res.redirect("/admin/categories");
    }
  } catch (err) {
    console.log("error adding new category" + err);
    res.redirect("/admin/login");
  }
};

const showEditCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const currentCategory = await categoryModel.findById(categoryId);
    req.session.currentCategory = currentCategory;
    res.render("admin/editCategory", {
      documentTitle: "Category Management",
      session: req.session.admin,
      category: currentCategory,
    });
  } catch (err) {
    console.log(`Edit category page showing errot-${err}`);
    res.redirect("/admin/login");
  }
};

const saveEditCategory = async (req, res) => {
  try {
    const currentCategory = req.session.currentCategory;
    let newCategory = req.body.name;
    const duplicationCheck = await categoryModel.findOne({
      name: newCategory,
    });
    if (duplicationCheck) {
      res.render("admin/editCategory", {
        session: req.session.admin,
        documentTitle: "Edit Category",
        errorMessage: "Duplication of categories not allowed",
        category: null,
      });
    } else {
      await categoryModel.updateOne(
        { _id: currentCategory._id },
        { $set: { name: newCategory } }
      );
      res.redirect("/admin/categories");
    }
  } catch (err) {
    console.log(`category editing error-${err}`);
    res.redirect("/admin/login");
  }
};

module.exports = {
  listCategory,
  addCategory,
  showEditCategory,
  saveEditCategory,
};
