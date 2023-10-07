const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    yearEstablished:{
        type:Number,
        required:true,
    },
    countryOfOrigin:{
        type:Number,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false,
    }
})

const brandCollection = new mongoose.model("brandsCollection",brandSchema)

module.exports = brandCollection