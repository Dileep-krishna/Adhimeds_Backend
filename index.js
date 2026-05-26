require("dotenv").config()
const express= require("express")
const cors=require("cors")
const router=require("./router")
const connection=require("./connection")
const app=express()
app.use(cors())
app.use(express.json())
const path=require("path")

app.use("/imgUploads",express.static(path.join(__dirname,"imgUploads")))
app.use(router)

const Port=5000
app.listen(Port,()=>{
    console.log("server running successfully");
    
})
