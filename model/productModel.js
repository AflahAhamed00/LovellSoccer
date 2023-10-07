const mongoose = require('mongoose')
const brandCollection = require('../model/brandModel')
const categaryCollection = require('../model/categaryModel')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    catogary:{
        type:new mongoose.Types.ObjectId,
        ref:categaryCollection,
        required:true,
    },
    price:{
        type:String,
        required:true,
    },
    brand:{
        type:mongoose.Types.ObjectId,
        ref:brandCollection,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
    },
    size:{
        type:Number,
        required:true,
    }
})

const productCollection = new mongoose.model("productCollection",productSchema)

module.exports = productCollection