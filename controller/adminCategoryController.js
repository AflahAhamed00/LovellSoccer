const categoryModel = require('../model/categoryModel')

const listCategory = async(req,res)=>{
    try{
        const categoryList = await categoryModel.find()
        res.render('admin/categories',{
            documentTitle:"Category Management",
            session:req.session.admin,
            details:categoryList
        })

    }catch(err){
        console.log(`Admin Category landing page ${err} `);
        res.redirect('/admin/login')
    }
}

const addCategory = async(req,res)=>{
    try{
        let inputCategory=req.body.category
        inputCategory = inputCategory.toUpperCase()
        const category = await categoryModel.findOne({name:inputCategory})
        const categoryList = await categoryModel.find()
        if(category){
            res.render('admin/categories',{
                documentTitle:"Category Management",
                session:req.session.admin,
                details:categoryList,
                errorMessage:"Category already exist"
            })
        }else{
            const data = new categoryModel({
                name:inputCategory
            })
            await categoryModel.insertMany([data])
            res.redirect('/admin/categories')
        }
    }catch(err){
        console.log('error adding new category'+err);
        res.redirect('/admin/login')
    }
}

module.exports = {listCategory,addCategory}