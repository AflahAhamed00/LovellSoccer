const mongoose = require('mongoose')

const brandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
})

const brandCollection =  mongoose.model("brandsCollection",brandSchema)

module.exports = brandCollection