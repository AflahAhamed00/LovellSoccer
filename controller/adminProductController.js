// const productModel =



const viewProducts = async(req,res)=>{
    try{
            res.render('admin/products')
    }catch(err){
        console.log('admin product page showing '+err);
        res.redirect('/admin/dashboard')
    }
} 


module.exports = {viewProducts}