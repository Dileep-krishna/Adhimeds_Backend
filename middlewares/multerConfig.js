const multer = require("multer")

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"imgUploads")
    },
    filename:(req,file,cb)=>{
        cb(null,`image-${Date.now()}-${file.originalname}`)
    }
 
})
    const fileFilter=(req,file,cb)=>{
    if (file.mimetype.startsWith("image/")) {
        cb(null,true)
    }else{
        cb(new Error("only accept image files"),false)
    }
 }
 const multerConfig=multer({
    storage,
    fileFilter
 })
 module.exports=multerConfig

