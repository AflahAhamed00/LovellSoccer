const orderModel = require('../model/orderModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const brandModel = require('../model/brandModel')
const categoryModel = require('../model/categoryModel')
const moment = require('moment')
const nodemailer = require('nodemailer')

const placeOrder = async(req,res)=>{
    try {
        
    } catch (err) {
        console.log('error in placing order - ',err);
    }
}

module.exports = {placeOrder}