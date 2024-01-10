const express = require("express");
const session=require('express-session')
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const dbConnect = require("./dbconnection");
const orderModel = require('./model/orderModel')
const app = express();
const cron = require('node-cron')
 
dotenv.config({ path: "config.env" });

dbConnect()
cron.schedule("0 * * * *", async () => {
  try {
    // Fetch orders that are not delivered and have a delivery time in the past
    const ordersToUpdate = await orderModel.find({
      deliveredOn: { $lt: new Date() },
      status: { $nin: ["Delivered", "cancelled"] },// To avoid unnecessary updates
    });

    // Update the status for each order
    for (const order of ordersToUpdate) {
      await orderModel.findByIdAndUpdate(order._id, {
        $set: {
          delivered:true,
          status: "Delivered",
        },
      });
    }

    console.log("Order status updated successfully.");
  } catch (error) {
    console.error("Error updating order status:", error);
  }
});

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
