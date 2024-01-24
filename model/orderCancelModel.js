const mongooose = require('mongoose')
const userModel = require('../model/userModel')
const oderModel = require('../model/orderModel')
const orderModel = require('../model/orderModel')

const orderCancelSchema = new mongooose.Schema({
    customer:{
        type:mongooose.Types.ObjectId,
        ref:userModel
    },
    order:{
        type:mongooose.Types.ObjectId,
        ref:orderModel
    },
    accept:{
        type:Boolean,
        default:false
    }
})

const orderCancelModel = new mongooose.model("cancelOrderRequest",orderCancelSchema)

module.exports = orderCancelModel