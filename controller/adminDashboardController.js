const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");

const view = async (req, res) => {
  try {
    let productCount = (await productModel.find()).length;
    let orderCount = (await orderModel.find()).length;
    let customerCount = (await userModel.find()).length;
    let totalRevenue = await orderModel.aggregate([
      {
        $match: {
          status: {
            $nin: ["cancelled", "In-transit"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$finalPrice",
          },
        },
      },
      {
        $project: { _id: 0, totalRevenue: 1 },
      },
    ]);
    totalRevenue = totalRevenue[0].totalRevenue;

    res.render("admin/dashboard", {
      productCount,
      orderCount,
      customerCount,
      totalRevenue,
      session: req.session.admin,
    });
  } catch (err) {
    console.log(`dashboard main page ` + err);
  }
};

const chartData = async (req, res) => {
  try {
    let currentYear = new Date();
    currentYear = currentYear.getFullYear();
    let orderData = await orderModel.aggregate([
      {
        $match: {
          delivered: true,
          status: {
            $nin: ["cancelled", "In-transit"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: "$totalQuantity",
          billAmount: "$finalPrice",
          week: {
            $dayOfWeek: "$orderedOn",
          },
          month: {
            $month: "$orderedOn",
          },
          year: {
            $year: "$orderedOn",
          },
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalProducts: { $sum: "$totalProducts" },
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$billAmount" },
          avgBillPerOrder: { $avg: "$billAmount" },
        },
      },
      {
        $match: {
          "_id.year": currentYear,
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    const delivered = await orderModel
      .find({ delivered: true, status: "Delivered" })
      .count();
    const cancelled = await orderModel.find({ status: "cancelled" }).count();

    const notDelivered = await orderModel
      .find({ status: "In-transit" })
      .count();

    res.json({
      data: { orderData, notDelivered, delivered, cancelled },
    });
  } catch (err) {
    console.log("error on getting chart data - ", err);
  }
};

const customChartData = async (req, res) => {
  try {
    const period = req.params.id;
    console.log(period);
    if (period == "lastmonth") {
      let delivered = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { delivered: true },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 30 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      delivered = delivered.length;

      let cancelled = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: "cancelled" },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 30 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      cancelled = cancelled.length;

      let notDelivered = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: "In-transit" },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 30 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      notDelivered = notDelivered.length;

      res.json({
        data: { notDelivered, cancelled, delivered },
      });
    } else if (period == "lastweek") {
      let delivered = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { delivered: true },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 6 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      delivered = delivered.length;

      let cancelled = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: "cancelled" },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 6 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      cancelled = cancelled.length;

      let notDelivered = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: "In-transit" },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 6 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      notDelivered = notDelivered.length;
      res.json({
        data: { notDelivered, cancelled, delivered },
      });
    } else if (period == "last3month") {
      let delivered = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { delivered: true },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 90 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      delivered = delivered.length;

      let cancelled = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: "cancelled" },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 90 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      cancelled = cancelled.length;

      let notDelivered = await orderModel.aggregate([
        {
          $match: {
            $and: [
              { status: "In-transit" },
              {
                orderedOn: {
                  $gte: new Date(
                    new Date().getTime() - 90 * 24 * 60 * 60 * 1000
                  ),
                },
              },
            ],
          },
        },
      ]);
      notDelivered = notDelivered.length;
      res.json({
        data: { notDelivered, cancelled, delivered },
      });
    }
  } catch (err) {
    console.log("error in getting custom chart data - ", err);
  }
};

module.exports = { view, chartData, customChartData };
