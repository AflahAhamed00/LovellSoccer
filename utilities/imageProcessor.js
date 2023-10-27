const multer = require('multer')

const multerStorage = multer.memoryStorage()

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith("image")){
        cb(null,true)
    }else{
        cb(console.log("Multer Filter: Must upload an Image"),false)
    }
}

const upload = multer({storage: multerStorage, fileFilter:multerFilter})

module.exports = upload