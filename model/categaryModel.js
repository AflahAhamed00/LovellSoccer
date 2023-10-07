const mongoose = require("mongoose")

const categarySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    }
})

const categaryCollection = new mongoose.model("categaryCollection",categarySchema)

module.exports = categaryCollection