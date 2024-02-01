const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const userModel = require("../model/userModel");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const brandModel = require("../model/brandModel");
const productModel = require("../model/productModel");
const cartModel = require("../model/cartModel");
const { request } = require("express");
const wishlistModel = require("../model/wishlistModel");
const categoryModel = require("../model/categoryModel");
const bannerModel = require("../model/bannerModel");
// const { name } = require("ejs");

let OTP = otpGenerator.generate(4, {
  digits: true,
  alphabets: false,
  upperCaseAlphabets: false,
  lowerCaseAlphabets: false,
  specialChars: false,
});
console.log(`generated OTP is ${OTP}`);

const sendVerifyMail = async (name, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.VERIFICATION_MAIL_ID,
      pass: process.env.VERIFICATION_MAIL_PASSWORD,
    },
  });

  // define the mail subject

  const mailOptions = {
    from: process.env.VERIFICATION_MAIL_ID,
    to: email,
    subject: "Your OTP code",
    text: `Hi ${name}, Your OTP code for the registration is ${OTP}`,
  };

  // send the email

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(`Error in sending ` + error);
      return true;
    } else {
      console.log(`Email sent: ` + info.response);
      return false;
    }
  });
};
// Login of the user

const showLoginPage = async (req, res) => {
  try {
    const categoryList = await categoryModel.find();
    res.render("user/userLoginPage", {
      categories: categoryList,
      userData: 0,
      errMsg: false,
    });
  } catch (err) {
    console.log(`showing login page ${err}`);
  }
};

const userLogin = async (req, res) => {
  const inputPassword = req.body.password;
  try {
    let hashedPassword;
    const checkUser = await userModel.findOne({ email: req.body.email });
    const categoryList = await categoryModel.find();
    if (checkUser) {
      hashedPassword = await bcrypt.compare(inputPassword, checkUser.password);
    }
    if (checkUser && hashedPassword) {
      if (checkUser.block) {
        res.render("user/userLoginPage", {
          categories: categoryList,
          userData: 0,
          errMsg: "Sorry you are banned",
        });
      } else {
        req.session.userLoggedIn = true;
        req.session.user = checkUser;
        res.redirect("/");
      }
    } else {
      res.render("user/userLoginPage", {
        categories: categoryList,
        userData: 0,
        errMsg: `Invalid Credentials`,
      });
    }
  } catch (err) {
    console.log(`user Login ${err}`);
    res.redirect("/userLogin");
  }
};

// signup of the user

const signUpPage = async (req, res) => {
  try {
    const categoryList = await categoryModel.find();
    res.render("user/userSignUpPage", {
      categories: categoryList,
      userData: 0,
      errMsg: false,
    });
  } catch (err) {
    console.log(`signUp ${err}`);
  }
};

const registerUserDetails = async (req, res) => {
  req.session.userDetails = req.body;
  console.log(req.body);
  
  const categoryList = await categoryModel.find();
  try {
    const userExists = await userModel.findOne({ email: req.body.email });

    if (userExists) {
      res.render("user/userSignUpPage", {
        errMsg: `User email already exists`,
        userData,
      });
    } else {
      sendVerifyMail(req.body.name, req.body.email);
      req.session.currentTime = Date.now();
      req.session.targetTime = Date.now() + 30000;
      req.session.otp = OTP;

      console.log("old-", req.session.otp);

      res.render("user/otpVerification", {
        categories: categoryList,
        userData: 0,
        wishlistCount: 0,
        cartCount: 0,
        userId: 0,
        errMsg: false,
      });
    }
  } catch (err) {
    console.log(`OTP generating ${err}`);
  }
};

// OTP verification
const otpVerification = async (req, res) => {
  const { name, email, password, phoneNumber } = req.session.userDetails;
  try {
    const currentTime = Date.now();
    const categoryList = await categoryModel.find();
    if (req.session.targetTime >= currentTime) {
      if (req.session.otp === req.body.otp) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
          name: name,
          email: email,
          phoneNumber: phoneNumber,
          password: hashedPassword,
        });

        res.render("user/userLoginPage", {
          categories: categoryList,
          userData: 0,
          errMsg: false,
        });

        req.session.user = user;
        await userModel.insertMany([user]);
        const newUser = await userModel.findOne({ name: user.name }); // Fetch the newly created user

        // Create a new cart for the user
        const newCart = await cartModel({
          customer: new mongoose.Types.ObjectId(newUser._id),
        });

        // Update the user document with the cart ID
        await userModel.findByIdAndUpdate(newUser._id, {
          $set: { cart: new mongoose.Types.ObjectId(newCart._id) },
        });

        await newCart.save();
        // Create a new wishlist for the user
        const newWishlist = await wishlistModel({
          customer: new mongoose.Types.ObjectId(newUser._id),
        });

        // Update the user document with the wishlist ID
        await userModel.findByIdAndUpdate(newUser._id, {
          $set: { wishlist: new mongoose.Types.ObjectId(newWishlist._id) },
        });

        await newWishlist.save();

        console.log("cart and whislist created");
      } else {
        res.render("user/otpVerification", {
          userId: 0,
          errMsg: `Invalid OTP`,
          categories: categoryList,
        });
      }
    } else {
      res.render("user/otpVerification", {
        userId: 0,
        errMsg: `OTP timed out`,
      });
    }
  } catch (err) {
    console.log(`OTP verification ${err}`);
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { name, email } = req.session.userDetails;
    OTP = otpGenerator.generate(4, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    sendVerifyMail(name, email);
    req.session.currentTime = Date.now();
    req.session.targetTime = Date.now() + 30000;
    req.session.otp = OTP;

    console.log("new-", req.session.otp);
    res.render("user/otpVerification", { userId: 0, errMsg: false });
  } catch (err) {
    console.log(`resend otp ${err}`);
  }
};

//forgot password page

const forgotPasswordPage = async (req, res) => {
  try {
    const categoryList = await categoryModel.find()
    res.render("user/forgotPassword", {categories:categoryList, userData: 0, mail: true, errMsg: 0 });
  } catch (err) {
    console.log(`forgot password ${err}`);
    res.redirect("/userLogin");
  }
};

const sendForgotPasswordOtp = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      req.session.invalidEmail = true;
      res.redirect("/forgotPassword");
    } else {
      req.session.userDetails = user;
      sendVerifyMail("User", req.body.email);
      req.session.forgotPasswordTargetTime = Date.now() + 30000;
      req.session.forgotOtp = OTP;
      console.log("forgotPasswordOtp - ", req.session.forgotOtp);
      req.session.otpPage = true;
      res.redirect("/getForgotPasswordOtp");
    }
  } catch (err) {
    console.log(`sendForgotPasswordOtp ${err}`);
    res.redirect("/userLogin");
  }
};

const getForgotPasswordOtp = async (req, res) => {
  try {
    if (req.session.invalidEmail) {
      req.session.invalidEmail = false;
      res.render("user/forgotPassword", {
        userData: 0,
        mail: true,
        errMsg: `User email not found, kindly signup`,
      });
    } else if (req.session.otpPage) {
      req.session.otpPage = false;
      const categoryList = await categoryModel.find()
      res.render("user/forgotPassword", {
        categories:categoryList,
        userData: 0,
        otpPage: true,
        errMsg: 0,
      });
    }
  } catch (err) {
    console.log(`getForgotPasswordOtp ${err}`);
    res.redirect("/userLogin");
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    let forgotPasswordCurrentTime = Date.now();
    if (req.session.forgotPasswordTargetTime >= forgotPasswordCurrentTime) {
      if (req.session.forgotOtp == req.body.otp) {
        res.render("user/forgotPassword", {
          userData: 0,
          changePassword: true,
          errMsg: 0,
        });
      } else {
        res.render("user/forgotPassword", {
          userData: 0,
          otpPage: true,
          errMsg: `Invalid OTP`,
        });
      }
    } else {
      res.render("user/forgotPassword", {
        userData: 0,
        otpPage: true,
        errMsg: `OTP expired, kindly wait`,
      });
    }
  } catch (err) {
    console.log(`verifyForgotPasswordOtp ${err}`);
    res.redirect("/userLogin");
  }
};

const resendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.session.userDetails;
    sendVerifyMail("User", email);
    OTP = otpGenerator.generate(4, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    req.session.otp = OTP;
    req.session.forgotPasswordTargetTime = Date.now() + 30000;
    console.log("New forgotPasswordOtp - ", req.session.forgotOtp);
    res.render("user/forgotPassword", {
      userData: 0,
      otpPage: true,
      errMsg: 0,
    });
  } catch (err) {
    console.log(`resend forgotPasswordOtp ${err}`);
    res.redirect("/userLogin");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.session.userDetails;
    const user = await userModel.findOne({ email });
    const newHashedPassword = await bcrypt.hash(req.body.password, 10);
    await userModel.updateOne(
      { _id: user._id },
      { $set: { password: newHashedPassword } }
    );
    res.redirect("/userLogin");
  } catch (err) {
    console.log(`resetPassword ${err}`);
    res.redirect("/userLogin");
  }
};

// Landing page

const landingPage = async (req, res) => {
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
    const productList = await productModel.find();
    const bannerList = await bannerModel.find({ active: true });
    res.render("user/landingPage", {
      brand: brandList,
      product: productList,
      categories: categoryList,
      banners: bannerList,
      userData,
      cartCount: cart,
      wishlistCount: wishlist,
    });
  } catch (err) {
    console.log(`user landing page rendering err -${err}`);
  }
};

module.exports = {
  showLoginPage,
  signUpPage,
  forgotPasswordPage,
  sendForgotPasswordOtp,
  getForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
  resetPassword,
  userLogin,
  registerUserDetails,
  otpVerification,
  resendOtp,
  landingPage,
};
