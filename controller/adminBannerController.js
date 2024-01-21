const bannerModel = require("../model/bannerModel");
const sharp = require("sharp");
const path = require("path");

const getBannerPage = async (req, res) => {
  try {
    const availableBanners = await bannerModel.find();
    res.render("admin/banners", {
      documentTitle: "Banner Management",
      session: req.session.admin,
      banners: availableBanners,
    });
  } catch (err) {
    console.log("error in getting banner page - ", err);
    res.redirect("/admin/dashboard");
  }
};

const addNewBanner = async (req, res) => {
  try {
    if (req.file) {
      let bannerImage = `${req.body.title}_${Date.now()}.png`;
      sharp(req.file.buffer)
        .toFormat("png")
        .png({ quality: 100 })
        .toFile(`public/img/banners/${bannerImage}`);

      req.body.image = bannerImage;
    }
    const newBanner = new bannerModel({
      title: req.body.title,
      image: req.body.image,
      description: req.body.description,
    });
    await bannerModel.insertMany([newBanner]);
    res.redirect("/admin/bannerManagement");
  } catch (err) {
    console.log("error in adding banner - ", err);
    res.redirect("/admin/dashboard");
  }
};

const changeBannerActivity = async (req, res) => {
  try {
    let bannerId = req.body.bannerId;
    let currentActivity = req.body.currentActivity;

    let changeActivity = currentActivity === "true" ? false : true;

    await bannerModel.findByIdAndUpdate(bannerId, {
      $set: {
        active: changeActivity,
      },
    });
    res.json({
      data: "success",
    });
  } catch (err) {
    console.log("error in changing the activity - ", err);
    res.redirect("/admin/dashboard");
  }
};

const deleteBanner = async (req, res) => {
  try {
    let bannerId = req.body.bannerId;
    await bannerModel.findByIdAndDelete(bannerId);
    res.json({
      data: "success",
    });
  } catch (err) {
    console.log("error in deleting the banner", err);
    res.redirect("/admin/dashboard");
  }
};

module.exports = {
  getBannerPage,
  addNewBanner,
  changeBannerActivity,
  deleteBanner,
};
