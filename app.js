const express = require("express");
const session=require('express-session')
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const dbConnect = require("./dbconnection");
const app = express();
 
dotenv.config({ path: "config.env" });

dbConnect()

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("tiny"));
app.use( 
  session({
  secret: process.env.SESSION_SECRET_KEY, 
  resave:false,
  saveUninitialized:false
}) 
);

app.use("/", require("./routes/userRouter"));
app.use("/admin",require("./routes/adminRouter"))

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`);
});
