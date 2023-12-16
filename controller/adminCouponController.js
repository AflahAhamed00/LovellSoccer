const couponModel = require('../model/couponModel')
const moment = require('moment')

const getCouponPage = async(req,res)=>{
    try {
        const couponList = await couponModel.find()

        res.render('admin/coupons',{
            documentTitle:"Coupon Management",
            session:req.session.admin,
            coupons:couponList,
            moment
        })
    } catch (err) {
        console.log('showing admin coupon page error - ',err);
    }
}

const addNewCoupon = async(req,res)=>{
    try {
        
    } catch (err) {
        console.log();
    }
}

module.exports = {getCouponPage}