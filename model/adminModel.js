const mongoose = require('mongoose')

const adminLoginSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
        required:true
    }
})

const adminLogin = mongoose.model("adminDetails",adminLoginSchema)

module.exports = adminLogin