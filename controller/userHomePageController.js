const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const userModel = require("../model/userModel");
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const userData = require("../model/userModel");
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
    res.render("user/userLoginPage", { userData: 0, errMsg: false });
  } catch (err) {
    console.log(`showing login page ${err}`);
  }
};

const userLogin = async (req, res) => {
  const inputPassword = req.body.password
  try {
    let hashedPassword;
    const checkUser = await userModel.findOne({ email: req.body.email });
    if (checkUser) {
      hashedPassword = await bcrypt.compare(
        inputPassword,
        checkUser.password
      );
    }
    if (checkUser && hashedPassword) {
      if (checkUser.ban) {
        res.render('user/userLoginPage', { userData: 0, errMsg: 'Sorry you are banned' })
      }
      else {
        req.session.userLoggedIn = true;
        req.session.user = checkUser; 
        res.redirect('/'); 
      } 
    }
    else{
      res.render('user/userLoginPage',{ userData: 0, errMsg:`Invalid Credentials`})
    }
  } catch (err) {
    console.log(`user Login ${err}`);
    res.redirect("/userLogin");
  }
};

// signup of the user

const signUpPage = async (req, res) => {
  try {
    res.render("user/usersignUpPage", { userData: 0, errMsg: false });
  } catch (err) {
    console.log(`signUp ${err}`);
  }
};

const registerUserDetails = async (req, res) => {
  req.session.userDetails = req.body;
  console.log(req.body);
  console.log("fds");
  try {
    const userExists = await userModel.findOne({ email: req.body.email });

    if (userExists) {
      res.render("user/userSignUpPage", {
        errMsg: `User email already exists`,
        userData: 0,
      });
    } else {
      sendVerifyMail(req.body.name, req.body.email);
      req.session.currentTime = Date.now();
      req.session.targetTime = Date.now() + 30000;
      req.session.otp = OTP;

      console.log("old-", req.session.otp);

      res.render("user/otpVerification", { userId: 0, errMsg: false });
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
    if (req.session.targetTime >= currentTime) {
      if (req.session.otp === req.body.otp) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
          name: name,
          email: email,
          phoneNumber: phoneNumber,
          password: hashedPassword,
        });
        req.session.user = user;
        await userModel.insertMany([user]);
        res.render("user/userLoginPage", { userData: 0, errMsg: false });
      } else {
        res.render("user/otpVerification", {
          userId: 0,
          errMsg: `Invalid OTP`,
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
    res.render("user/forgotPassword", { userData: 0, mail: true, errMsg: 0 });
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
      res.render("user/forgotPassword", {
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
    console.log("landingpage");
  } catch (err) {}
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
  landingPage
};
