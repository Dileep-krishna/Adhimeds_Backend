const  express=require("express")
const multer = require("multer");

const multerConfig = require("./middlewares/multerConfig");
const { addDeliveryBoy, getAllDeliveryBoys, deleteDeliveryBoy, updateDeliveryBoy,  } = require("./controller/DeliveryboysController");



const router=express.Router()

//testing path
router.post("/test",(req,res)=>{
    res.status(200).json("working")
})
router.post(
  "/add",
  multerConfig.fields([
    { name: "aadharImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 }
  ]),
  addDeliveryBoy
);

router.get("/all", getAllDeliveryBoys);

router.delete("/:id", deleteDeliveryBoy);

// router.put(
//   "/:id",
//   multerConfig.fields([
//     { name: "aadharImage", maxCount: 1 },
//     { name: "licenseImage", maxCount: 1 }
//   ]),
//   updateDeliveryBoy
// );



module.exports=router