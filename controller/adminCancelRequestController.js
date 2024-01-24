const orderCancelModel = require("../model/orderCancelModel");
const orderModel = require('../model/orderModel')

const getAllCancelRequests = async (req, res) => {
  try {
    const cancelRequests = await orderCancelModel.find();

    res.render("admin/cancelRequestPage", {
      documentTitle: "Order Cancel Management",
      session: req.session.admin,
      details: cancelRequests,
    });
  } catch (err) {
    console.log("error in rendering cancel request page - ", err);
    res.redirect("/admin/dashboard");
  }
};

const acceptCancelRequest = async(req,res)=>{
    try {
        console.log(req.body);
        let cancelRequestId = req.body.id
        let currentCancelStatus = req.body.currentCancelStatus
        let orderId = req.body.orderId
        let customer = req.body.customer
        let changeCancelStatus = currentCancelStatus === 'false' ? true : false
        await orderCancelModel.findByIdAndUpdate(cancelRequestId, {
            $set: {
             accept:changeCancelStatus
            },
          });

          let order = await orderModel.findOneAndUpdate({_id:orderId,customer:customer},{
            $set:{
                status:'cancelled'
            }
          })
          console.log('selected order - ',order);
          res.json({
            data: "success",
          });
    } catch (err) {
        console.log('error in accepting the cancel request - ',err);
        res.redirect('/admin/dashboard')
    }
}

module.exports = { getAllCancelRequests, acceptCancelRequest};
