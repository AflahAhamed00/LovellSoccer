const express = require("express")
const morgan = require("morgan")
const dotenv = require("dotenv")
const path = require("path")
const mongoose = require("mongoose")
const dbConnect = require("./dbconnection")
const app = express()

dotenv.config({path:"config.env"})

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))
app.use(morgan("tiny"))

app.use("/",require("./routes/userRouter"))

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`Server listening at ${PORT}`)
})