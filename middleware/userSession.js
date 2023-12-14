const userLoginSession = async (req, res, next) => {
  let userData = req.session.user;
  if (req.session.userLoggedIn) {
    console.log("user logged in");
    next();
  } else {
    console.log("Need to login first");
    res.render("user/userLoginPage", { userData, errMssg: false });
  }
};

module.exports =  {userLoginSession} ;
