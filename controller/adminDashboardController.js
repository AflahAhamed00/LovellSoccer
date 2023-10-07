


const view = async(req,res)=>{
    try{
        let productCount = 43
        let orderCount = 5
        let customerCount = 6
        let totalRevenue = 45000
        res.render('admin/dashboard',{
           productCount,
           orderCount,
           customerCount,
           totalRevenue,
           session: req.session.admin
        })
    }catch(err){
        console.log(`dashboard main page `+err);
    }
}

module.exports={view}