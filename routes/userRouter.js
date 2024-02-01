const express = require("express")
const userHomePageController = require("../controller/userHomePageController")
const userProductController = require("../controller/userProductController")
const userCartController = require('../controller/userCartConroller')
const userWishlistController = require('../controller/userWishlistController')
const userCheckoutController = require('../controller/userCheckoutController')
const userProfileController = require('../controller/userProfileController')
const userOrderController = require('../controller/userOrderController')
const userSession = require('../middleware/userSession')
const router = express.Router()

// Home page 
router.get('/',userHomePageController.landingPage)

// login of the user

router
.get('/userLogin',userHomePageController.showLoginPage)

router
.post("/userLogin",userHomePageController.userLogin)

// log out of user
router
.get("/userLogout",userHomePageController.userLogout)

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

// filtering
router
.post('/user/filterProducts',userProductController.filterProducts)


// brand based product showing
router
.get('/brand/:id',userProductController.brandBasedProducts)


// category based product showing
router
.get('/MEN/:id',userProductController.categoryBasedProducts)
.get('/WOMEN/:id',userProductController.categoryBasedProducts)
.get('/KIDS/:id',userProductController.categoryBasedProducts)

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
get('/userProfile',userSession.userLoginSession, userProfileController.showUserProfilePage)
.get('/userProfile/editAddressPage/:id',userSession.userLoginSession, userProfileController.getAddressEditingPage)
.put('/userProfile/address/update',userSession.userLoginSession,userProfileController.updateAddress)
.get('/user/allOrders',userSession.userLoginSession,userProfileController.getAllOrders)

// profile name editing and updating

router 
.route('/userProfile/profile/update')
.put(userSession.userLoginSession,userProfileController.updateProfile)

// profile email and phone editig and updating
router
.put('/userProfile/emailPhone/update',userSession.userLoginSession,userProfileController.updateEmailPhone)

// user profile password updating
router
.put('/userProfile/password/update',userSession.userLoginSession,userProfileController.updatePassword)

// user proceed to payment page

router
.get('/cart/proceedToPayment',userCartController.proceedToPayment)

// apply coupon

router
.post('/applyCoupon',userCheckoutController.applyCoupon)

// place order

router
.post('/placeOrder',userOrderController.placeOrder)

// cancel order
router
.post("/cancelOrder",userOrderController.cancelOrder)

// razorpay payment verification

router
.post('/verifyPayment',userOrderController.verifyPayment)

// order success
router
.get('/orderSuccess',userSession.userLoginSession,userOrderController.orderSuccess)

// current order details page 
router
.get('/orders',userSession.userLoginSession,userOrderController.viewOrders)

// adress page 

router
.get('/addressPage',userProfileController.showAdressPage)
.post('/addressPage',userProfileController.addAddress)

// search product

router
.get('/user/searchProducts',userProductController.getSearchProduct)

module.exports = router