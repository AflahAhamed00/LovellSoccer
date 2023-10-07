const mongoose = require("mongoose")

function dbConnect(){
   // console.log('mongodb connection string:',process.env.MONGODBCONNECTION_STRING)
    mongoose.connect(process.env.MONGODBCONNECTION_STRING,{
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    })
    .then(()=>{
        console.log('connected to database');
    })
    .catch(e=>{
        console.error(e);
    })
}

module.exports = dbConnect

