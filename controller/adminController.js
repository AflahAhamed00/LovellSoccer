const adminLoginModel = require("../model/adminModel");

const bcrypt = require("bcrypt");

const loginPage = async (req, res) => {
  res.render("admin/adminLogin", { documentTitle: "Admin Sign In" });
};

const adminVerification = async(req, res)=> {
  try{
         const inputPassword = req.body.password;
         const inputEmail = req.body.email.toLowerCase();
         const adminFind = await adminLoginModel.findOne({email : inputEmail});
         
         if(adminFind){
              if(adminFind.password === inputPassword){
                    req.session.admin = req.body.email;
                    console.log('Admin session created successfully');
                    res.redirect('/admin/dashboard');
              }
              else{
                    res.render('admin/adminLogin',{
                          documentTitle : 'Admin SignIn Page | MyPhone',
                          errorMessage:'Incorrect Password',
                          }
                    );
              }
        }
        else{
              res.render('admin/adminLogin', {errorMessage:'Invalid Credentials!'});
        }
  }
  catch(error){
        console.log('Failed to login'+ error);
        res.redirect('/admin/login')
  }

}

module.exports = {
  loginPage,
  adminVerification
};
