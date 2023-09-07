const express = require("express")
const userHomePageController = require("../controller/userHomePageController")
const router = express.Router()

router.get('/userLogin',userHomePageController.showLoginPage)

router.get("/signUp",userHomePageController.signUpPage) 

module.exports = router