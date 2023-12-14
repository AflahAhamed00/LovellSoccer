const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
})

const categoryCollection =  mongoose.model("categoryCollection",categorySchema)

module.exports = categoryCollection