const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    }
})

const categoryCollection = new mongoose.model("categoryCollection",categorySchema)

module.exports = categoryCollection