const express = require("express")
const userHomePageController = require("../controller/userHomePageController")
const router = express.Router()

// Home page 
router.get('/',userHomePageController.landingPage)

// login of the user

router
.get('/userLogin',userHomePageController.showLoginPage)

router
.post("/userLogin",userHomePageController.userLogin)

// signup of the user

router 
.get("/signUp",userHomePageController.signUpPage)

router
.post("/registerUser",userHomePageController.registerUserDetails) 

// otp verification
router
.post("/verifyOtp",userHomePageController.otpVerification)

router
.get('/resendOtp',userHomePageController.resendOtp)

// forgot password 
router
.get("/forgotPassword",userHomePageController.forgotPasswordPage)

router
.post('/sendForgotOtp',userHomePageController.sendForgotPasswordOtp)

router
.get('/getForgotPasswordOtp',userHomePageController.getForgotPasswordOtp)

router
.post('/verifyForgotPasswordOtp',userHomePageController.verifyForgotPasswordOtp)

router
.get('/resendForgotPasswordOtp',userHomePageController.resendForgotPasswordOtp)

router
.post('/resetPassword',userHomePageController.resetPassword)

module.exports = router