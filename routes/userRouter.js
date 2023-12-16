const express = require("express")
const userHomePageController = require("../controller/userHomePageController")
const userProductController = require("../controller/userProductController")
const userCartController = require('../controller/userCartConroller')
const userWishlistController = require('../controller/userWishlistController')
const userCheckoutController = require('../controller/userCheckoutController')
const userProfileController = require('../controller/userProfileController')
const userSession = require('../middleware/userSession')
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

// all products
router 
.get('/user/allProducts',userProductController.showAllProducts)
.post('/user/allProducts',userProductController.sortBy)


// product details
router
.get('/user/singleProductDetails/:id',userProductController.singleProductDetails)

//showing cart page
router
.get('/user/cart',userCartController.showCart)
.delete('/user/cart',userCartController.removeCartProduct)
// add to cart

router
.post('/product/addToCart',userCartController.addToCart)


// change Product Quantity

router
.put('/cart/changeProductQuantity',userCartController.addCount)
.delete('/cart/changeProductQuantity',userCartController.reduceCount)

// wishlist page showing

router
.get('/user/wishlist',userSession.userLoginSession,userWishlistController.showWishlistPage)
.delete('/user/wishlist',userSession.userLoginSession,userWishlistController.removeWishlistProduct)
.post('/user/wishlist',userSession.userLoginSession,userWishlistController.addToWishlist)

// userProfile page 
router.
get('/userProfile',userProfileController.showUserProfilePage)

// user proceed to payment page

router
.get('/cart/proceedToPayment',userCartController.proceedToPayment)

// adress page 

router
.get('/addressPage',userProfileController.showAdressPage)
.post('/addressPage',userProfileController.addAddress)

module.exports = router