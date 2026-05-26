const mongoose=require("mongoose")
const connection=process.env.DATABASE
mongoose.connect(connection).then(res=>{
    console.log("Mongo connected successfully");
    
}).catch(err=>{
    console.log('failed due to :',err);
    
})