const express = require('express')
const router = express.Router()
const adminController = require("../controller/adminController")
const adminSession = require('../middleware/adminSession')
const adminDashboardController = require('../controller/adminDashboardController')
const adminProductController = require('../controller/adminProductController')



router
.get('/login',adminController.loginPage)

router
.post('/login',adminController.adminVerification)


// Dashboard
router
.get('/dashboard',adminSession,adminDashboardController.view )

// Products

router
.get('/productManagement',adminSession,adminProductController.viewProducts)

module.exports = router