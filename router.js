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
import { 
  addProduct, 
  deleteProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct,
  getStoreProduct,
  updateStoreProduct,
  deleteStoreOverride,
  getCurrentStore,
  getAllStoreProducts,
  toggleProductAccessForStore,
  getStoreByEmail
} from "./controllers/productController.js";
import { deleteRolePermissions, getRolePermissions, setRolePermissions } from "./controllers/rolePermissionController.js";
import { createBrand, deleteBrand, getAllBrands, getBrandById, updateBrand } from "./controllers/brandController.js";
import { createWarranty, deleteWarranty, getAllWarranties, getWarrantyById, updateWarranty } from "./controllers/warrantyController.js";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "./controllers/noteController.js";
import { createAttribute, deleteAttribute, getAttributeById, getAttributes, updateAttribute } from "./controllers/attributeController.js";
import { createColor, deleteColor, getColorById, getColors, updateColor } from "./controllers/colorController.js";
import { createCustomReview, deleteCustomReview, getAllCustomReviews, getCustomReviewById, updateCustomReview } from "./controllers/customReviewController.js";
import { adminLogin } from "./controllers/authController.js";
import { storeLogin } from "./controllers/storeAuthController.js";
import { verifyStoreToken } from "./middlewares/jwtMiddleware.js";

const router = express.Router();

// ================= DELIVERY BOY ROUTES =================
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
router.post(
  "/category",
  multerConfig.fields([
    { name: "icon", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createCategory
);

router.get("/category", getCategories);
router.get("/category/:id", getCategoryById);
router.put(
  "/category/:id",
  multerConfig.fields([
    { name: "icon", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateCategory
);
router.delete("/category/:id", deleteCategory);

// ================= STORE MANAGEMENT =================
router.post(
  '/store',
  multerConfig.array('thumbnailImages', 10),
  addMedicalStore
);
router.get('/store', getAllMedicalStores);
// ✅ Specific routes must come before generic :id
router.get('/store/by-email', getStoreByEmail);        // email lookup
router.get('/store/products', getAllStoreProducts);   // list store products
router.get('/store/:id', getMedicalStoreById);
router.put(
  '/store/:id',
  multerConfig.array('thumbnailImages', 10),
  updateMedicalStore
);
router.delete('/store/:id', deleteMedicalStore);

// ================= STAFF ROUTES =================
router.post('/staff', addStaff);
router.get('/staff', getAllStaff);
router.get('/staff/:id', getStaffById);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// ================= PERMISSION ROUTES =================
router.get('/roles', getAllRoles);
router.get('/roles/:id', getRoleById);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// ================= PRODUCT ROUTES (super-admin) =================
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

// ================= ROLE PERMISSIONS =================
router.get('/role-permissions/:roleName', getRolePermissions);
router.put('/role-permissions/:roleName', setRolePermissions);
router.delete('/role-permissions/:roleName', deleteRolePermissions);

// ================= BRAND ROUTES =================
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

// ================= ATTRIBUTE ROUTES =================
router.get('/attributes', getAttributes);
router.get('/attributes/:id', getAttributeById);
router.post('/attributes', createAttribute);
router.put('/attributes/:id', updateAttribute);
router.delete('/attributes/:id', deleteAttribute);

// ================= COLOR ROUTES =================
router.get('/colors', getColors);
router.get('/colors/:id', getColorById);
router.post('/colors', createColor);
router.put('/colors/:id', updateColor);
router.delete('/colors/:id', deleteColor);

// ================= CUSTOM REVIEW ROUTES =================
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
router.use('/custom-reviews', customReviewRouter);

// ================= ADMIN LOGIN =================
router.post('/login', adminLogin);

// ================= STORE LOGIN & AUTH =================
router.post('/store/login', storeLogin);
router.get('/auth/current-store', verifyStoreToken, getCurrentStore);

// ================= STORE PRODUCT OVERRIDE ROUTES =================
router.get("/store/products/:id", getStoreProduct);
router.put("/store/products/:id", updateStoreProduct);
router.delete("/store/products/:id/override", deleteStoreOverride);
router.put('/store/product-access/:productId/:storeId', toggleProductAccessForStore);

export default router;