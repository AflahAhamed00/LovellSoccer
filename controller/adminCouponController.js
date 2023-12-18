const couponModel = require("../model/couponModel");
const moment = require("moment");

const getCouponPage = async (req, res) => {
  try {
    const couponList = await couponModel.find();

    res.render("admin/coupons", {
      documentTitle: "Coupon Management",
      session: req.session.admin,
      coupons: couponList,
      moment,
    });
  } catch (err) {
    console.log("showing admin coupon page error - ", err);
  }
};

const addNewCoupon = async (req, res) => {
  try {
    const newCoupon = new couponModel({
      name: req.body.name,
      code: req.body.code.toUpperCase(),
      discount: req.body.discount,
      startingDate: req.body.startingDate,
      expiryDate: req.body.expiryDate,
      totalCount: req.body.totalCount,
    });

    await newCoupon.save();
    res.redirect("/admin/couponManagement");
  } catch (err) {
    console.log("coupon adding error - ", err);
    res.redirect("/admin/login");
  }
};

const changeCouponActivity = async (req, res) => {
  try {
    const currentCoupon = await couponModel.findById(req.query.id);
    let currentActivity = currentCoupon.active;

    if (currentActivity == true) {
      currentActivity = false;
    } else {
      currentActivity = true;
    }

    currentActivity = Boolean(currentActivity);

    await couponModel.findByIdAndUpdate(currentCoupon._id, {
      $set: {
        active: currentActivity,
      },
    });

    res.redirect("/admin/couponManagement");
  } catch (err) {
    console.log("Error in changing the activity of coupon - ", err);
    res.redirect("/admin/login");
  }
};

module.exports = { getCouponPage, addNewCoupon, changeCouponActivity };
