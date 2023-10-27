const userModel = require("../model/userModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.render("admin/customers", {
      allCustomers: users,
      documentTitle: "Customer Management",
      session: req.session.admin,
    });
  } catch (err) {
    console.log("Customer management page showing" + err);
    res.redirect("/admin/login");
  }
};

const updateBan = async (req, res) => {
  try {
    let currentAccess = req.body.Block === "true";
    currentAccess = !currentAccess;
    await userModel.updateOne(
      {
        _id: req.body.userId,
      },
      {
        $set: {
          block: currentAccess,
        },
      }
    );
    res.json({
      data: { newAccess: currentAccess },
    });
  } catch (err) {
    console.log("Customer blocking or non blocking" + err);
    res.redirect("/admin/login");
  }
};
module.exports = { getAllUsers, updateBan };
