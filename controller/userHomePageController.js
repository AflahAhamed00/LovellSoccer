const userModel = require("../model/userModel")
const {default: mongoose} = require("mongoose")


// Login of the user

const showLoginPage = async(req,res)=>{
    try{
        res.render("user/userLoginPage",{userData: 0, errMsg: false})
    }
    catch(err){
        console.log(`login ${err}`);
    }
    
}

// signup of the user

const signUpPage = async(req,res)=>{
    try{
        res.render("user/usersignUpPage",{userData: 0, errMsg: false})
    }
    catch(err){
        console.log(`signUp ${err}`)
    }
}


module.exports = {
    showLoginPage,
    signUpPage
}
