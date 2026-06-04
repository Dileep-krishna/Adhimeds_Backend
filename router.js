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
import { createRole, deleteRole, getAllRoles, getRoleById, updateRole, updateRolePermissions } from "./controllers/roleController.js";
import { addProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "./controllers/productController.js";
import { deleteRolePermissions, getRolePermissions, setRolePermissions } from "./controllers/rolePermissionController.js";
import { createBrand, deleteBrand, getAllBrands, getBrandById, updateBrand } from "./controllers/brandController.js";
import { createWarranty, deleteWarranty, getAllWarranties, getWarrantyById, updateWarranty } from "./controllers/warrantyController.js";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "./controllers/noteController.js";
import { createAttribute, deleteAttribute, getAttributeById, getAttributes, updateAttribute } from "./controllers/attributeController.js";
import { createColor, deleteColor, getColorById, getColors, updateColor } from "./controllers/colorController.js";
import { createCustomReview, deleteCustomReview, getAllCustomReviews, getCustomReviewById, updateCustomReview } from "./controllers/customReviewController.js";
import { adminLogin } from "./controllers/authController.js";


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
router.post(
  '/store',
  multerConfig.array('thumbnailImages', 10), // max 10 images
  addMedicalStore
);

router.get('/store', getAllMedicalStores);
router.get('/store/:id', getMedicalStoreById);

router.put(
  '/store/:id',
  multerConfig.array('thumbnailImages', 10),
  updateMedicalStore
);

router.delete('/store/:id', deleteMedicalStore);

// ================= staff ROUTES =================
router.post('/staff', addStaff);
router.get('/staff', getAllStaff);
router.get('/staff/:id', getStaffById);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// ================= permission ROUTES =================
router.get('/roles', getAllRoles);
router.get('/roles/:id', getRoleById);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// ================= product ROUTES =================
const productUploadFields = multerConfig.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 },
  { name: 'metaImage', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 },
  { name: 'videoThumbnail', maxCount: 1 },
  { name: 'pdfSpec', maxCount: 1 },
]);

router.post('/products', productUploadFields, addProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', productUploadFields, updateProduct);
router.delete('/products/:id', deleteProduct);
// -----------------Role Permissions-----------------
router.get('/role-permissions/:roleName', getRolePermissions);
router.put('/role-permissions/:roleName', setRolePermissions);
router.delete('/role-permissions/:roleName', deleteRolePermissions);
// Brand routes with file upload (single file, field name = "logo")

router.get('/brands', getAllBrands);
router.get('/brands/:id', getBrandById);
router.post('/brands', multerConfig.single('logo'), createBrand);
router.put('/brands/:id', multerConfig.single('logo'), updateBrand);
router.delete('/brands/:id', deleteBrand);
// ================= WARRANTY ROUTES =================
router.get('/warranties', getAllWarranties);
router.get('/warranties/:id', getWarrantyById);
router.post('/warranties', multerConfig.single('logo'), createWarranty);
router.put('/warranties/:id', multerConfig.single('logo'), updateWarranty);
router.delete('/warranties/:id', deleteWarranty);
// ================= NOTE ROUTES =================
router.get('/notes', getAllNotes);
router.get('/notes/:id', getNoteById);
router.post('/notes', multerConfig.single('image'), createNote);
router.put('/notes/:id', multerConfig.single('image'), updateNote);
router.delete('/notes/:id', deleteNote);

// ================= ATTRIBUTE ROUTES (explicit, same style as notes) =================
router.get('/attributes', getAttributes);
router.get('/attributes/:id', getAttributeById);
router.post('/attributes', createAttribute);
router.put('/attributes/:id', updateAttribute);
router.delete('/attributes/:id', deleteAttribute);
// ===============color routes=============
router.get('/colors', getColors);
router.get('/colors/:id', getColorById);
router.post('/colors', createColor);
router.put('/colors/:id', updateColor);
router.delete('/colors/:id', deleteColor);
// ==========product review path============
// ========== CUSTOM REVIEW ROUTES (with named path) ==========
const customReviewRouter = express.Router();

const uploadFields = multerConfig.fields([
  { name: 'reviewerImage', maxCount: 1 },
  { name: 'newImages', maxCount: 10 }
]);

customReviewRouter.post('/', uploadFields, createCustomReview);
customReviewRouter.get('/', getAllCustomReviews);
customReviewRouter.get('/:id', getCustomReviewById);
customReviewRouter.put('/:id', uploadFields, updateCustomReview);
customReviewRouter.delete('/:id', deleteCustomReview);

// Mount under /custom-reviews
router.use('/custom-reviews', customReviewRouter);

// =======admin login============
router.post('/login', adminLogin);


export default router;