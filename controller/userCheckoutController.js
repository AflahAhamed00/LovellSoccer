const couponModel = require('../model/couponModel');
const cartModel = require('../model/cartModel')

const applyCoupon = async(req,res)=>{
    try {
        let couponCode = req.body.couponCode
        let cartDetails = await cartModel.findOne({customer:req.session.user._id})
        let totalAmount = cartDetails.totalPrice
        let couponList = await couponModel.findOne({code:couponCode, active:true})
        
            if(couponList){
                let startDate = Date.parse(couponList.startingDate)
                let expiryDate = Date.parse(couponList.expiryDate)
                let todayDate = new Date()

                todayDate = Date.parse(todayDate)

                if(startDate <= expiryDate && todayDate <= expiryDate && couponList.totalCount > 0){
                    let discount = couponList.discount
                    let response = {
                        totalAmount : totalAmount,
                        discount:discount
                    }
                    res.json({response})
                }else{
                    res.json({expiry : true})
                }
            }else{
                res.json({noCoupon : true})
            }

    } catch (err) {
        console.log('error in apply coupon - ',err);
        res.redirect('/')
    }
}

module.exports = {applyCoupon}