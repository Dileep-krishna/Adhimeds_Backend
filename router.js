import express from "express";
import multer from "multer";

import multerConfig from "./middlewares/multerConfig.js";

// ✅ DELIVERY BOY CONTROLLERS
import {
  addDeliveryBoy,
  getAllDeliveryBoys,
  deleteDeliveryBoy,
  updateDeliveryBoy,
} from "./controllers/deliveryBoysController.js";

// ✅ CATEGORY CONTROLLERS
import {
  getCategories,
  getCategoryById,
  deleteCategory,
  updateCategory,
  createCategory,
} from "./controllers/categoryManagmentController.js";
import { addMedicalStore, deleteMedicalStore, getAllMedicalStores, getMedicalStoreById, updateMedicalStore } from "./controllers/MedicalstoreManagementController.js";
import { addStaff, deleteStaff, getAllStaff, getStaffById, updateStaff } from "./controllers/staffmanagementController.js";
import { getAllRoles, getRolePermissions, updateRolePermissions } from "./controllers/roleController.js";

// ✅ MEDICAL STORE CONTROLLERS


const router = express.Router();


// ================= DELIVERY BOY ROUTES =================

// testing path
router.post("/test", (req, res) => {
  res.status(200).json("working");
});

router.post(
  "/add",
  multerConfig.fields([
    { name: "aadharImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
  ]),
  addDeliveryBoy
);

router.get("/all", getAllDeliveryBoys);

router.delete("/:id", deleteDeliveryBoy);

router.put(
  "/:id",
  multerConfig.fields([
    { name: "aadharImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
  ]),
  updateDeliveryBoy
);


// ================= CATEGORY ROUTES =================

// CREATE CATEGORY
router.post(
  "/category",
  multerConfig.fields([
    { name: "icon", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "banner", maxCount: 1 },        // added banner
  ]),
  createCategory
);

// GET ALL CATEGORIES
router.get("/category", getCategories);

// GET SINGLE CATEGORY
router.get("/category/:id", getCategoryById);

// UPDATE CATEGORY
router.put(
  "/category/:id",
  multerConfig.fields([
    { name: "icon", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "banner", maxCount: 1 },        // added banner
  ]),
  updateCategory
);

// DELETE CATEGORY
router.delete("/category/:id", deleteCategory);

// store-management router

router.post('/store', addMedicalStore);
router.get('/store', getAllMedicalStores);
router.put('/store/:id', updateMedicalStore);
router.delete('/store/:id', deleteMedicalStore);

// ================= staff ROUTES =================
router.post('/staff', addStaff);
router.get('/staff', getAllStaff);
router.get('/staff/:id', getStaffById);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// ================= permission ROUTES =================
router.get('/roles', getAllRoles);
router.get('/roles/:roleName/permissions', getRolePermissions);
router.put('/roles/:roleName/permissions', updateRolePermissions)

export default router;