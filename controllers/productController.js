// controllers/productController.js
import Product from '../model/AddProductPageModel.js';
import StoreProductOverride from '../model/StoreProductOverride.js';
import MedicalStore from '../model/MedicalstoreManagementModel.js'; // ✅ Add this import

// -------------------------------
// Helper: parse JSON strings safely
// -------------------------------
const parseJsonField = (value, defaultValue = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

// -------------------------------
// Helper: convert boolean strings
// -------------------------------
const toBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

// -------------------------------
// Helper: convert numeric strings
// -------------------------------
const toNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// -------------------------------
// Helper: allowed fields for store overrides (published REMOVED)
// -------------------------------
const STORE_OVERRIDE_ALLOWED_FIELDS = [
  'productName', 'brand', 'mainCategory', 'relatedCategories', 'unit',
  'weight', 'minPurchaseQty', 'tags', 'featured', 'todaysDeal',
  'flashTitle', 'refundable', 'refundNote', 'thumbnail', 'galleryImages',
  'description', 'metaTitle', 'metaDescription', 'metaImage', 'freeShipping',
  'flatRate', 'quantityMultiply', 'shippingDays', 'shippingNote', 'codAvailable',
  'codNote', 'unitPrice', 'discount', 'discountType', 'discountStartDate',
  'discountEndDate', 'stock', 'sku', 'barcode', 'hsnCode', 'gstRate', 'hideStock',
  'lowStockWarning', 'quantity', 'frequentlyBought', 'attributes', 'colorsEnabled',
  'selectedColors', 'variants'
];

// -------------------------------
// 1. CREATE a new product (super‑admin only – no storeId)
// -------------------------------
export const addProduct = async (req, res) => {
  try {
    const thumbnail = req.files?.thumbnail?.[0]?.filename || '';
    const metaImage = req.files?.metaImage?.[0]?.filename || '';
    const galleryImages = req.files?.galleryImages?.map(f => f.filename) || [];

    let {
      productName,
      mainCategory,
      brand,
      relatedCategories,
      unit,
      weight,
      minPurchaseQty,
      tags,
      published,
      featured,
      todaysDeal,
      refundable,
      refundNote,
      description,
      metaTitle,
      metaDescription,
      freeShipping,
      flatRate,
      quantityMultiply,
      shippingDays,
      shippingNote,
      codAvailable,
      codNote,
      attributes,
      unitPrice,
      discount,
      discountType,
      discountStartDate,
      discountEndDate,
      stock,
      sku,
      barcode,
      externalLink,
      externalLinkText,
      hsnCode,
      gstRate,
      hideStock,
      lowStockWarning,
      quantity,
      frequentlyBought,
    } = req.body;

    relatedCategories = parseJsonField(relatedCategories);
    tags = parseJsonField(tags);
    attributes = parseJsonField(attributes);
    frequentlyBought = parseJsonField(frequentlyBought);

    const missingFields = [];
    if (!productName?.trim()) missingFields.push('productName');
    if (!mainCategory?.trim()) missingFields.push('mainCategory');
    if (!brand?.trim()) missingFields.push('brand');
    if (!relatedCategories.length) missingFields.push('relatedCategories');
    if (!unit?.trim()) missingFields.push('unit');
    if (weight === undefined || weight === '') missingFields.push('weight');
    if (!minPurchaseQty) missingFields.push('minPurchaseQty');

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: `Missing mandatory fields: ${missingFields.join(', ')}`,
      });
    }

    const productData = {
      productName: productName.trim(),
      mainCategory: mainCategory.trim(),
      brand: brand.trim(),
      relatedCategories,
      unit: unit.trim(),
      weight: toNumber(weight, 0),
      minPurchaseQty: toNumber(minPurchaseQty, 1),
      tags,
      published: toBoolean(published, true),
      featured: toBoolean(featured, false),
      todaysDeal: toBoolean(todaysDeal, false),
      refundable: toBoolean(refundable, false),
      refundNote: refundNote || 'This product is eligible for return within 7 days of delivery.',
      thumbnail,
      galleryImages,
      description: description || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      metaImage,
      freeShipping: toBoolean(freeShipping, true),
      flatRate: toBoolean(flatRate, false),
      quantityMultiply: toBoolean(quantityMultiply, false),
      shippingDays: shippingDays || '',
      shippingNote: shippingNote || 'This product is shipped within 2-3 business days.',
      codAvailable: toBoolean(codAvailable, false),
      codNote: codNote || 'Cash on delivery available for orders within India.',
      attributes: attributes.map(attr => ({
        name: attr.name,
        values: attr.values.map(v => {
          if (typeof v === 'string') return { value: v, packSizes: [] };
          return { value: v.value, packSizes: Array.isArray(v.packSizes) ? v.packSizes : [] };
        })
      })),
      unitPrice: toNumber(unitPrice, 0),
      discount: toNumber(discount, 0),
      discountType: discountType || 'percent',
      discountStartDate: discountStartDate || null,
      discountEndDate: discountEndDate || null,
      stock: toNumber(stock, 0),
      sku: sku || '',
      barcode: barcode || '',
      externalLink: externalLink || '',
      externalLinkText: externalLinkText || '',
      hsnCode: hsnCode || '',
      gstRate: toNumber(gstRate, 0),
      hideStock: hideStock || 'none',
      lowStockWarning: toNumber(lowStockWarning, 0),
      quantity: toNumber(quantity, 1),
      frequentlyBought,
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message,
    });
  }
};

// -------------------------------
// 2. GET all products (super‑admin only – no storeId)
// -------------------------------
export const getAllProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, category, minPrice, maxPrice, published, featured, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.mainCategory = { $regex: new RegExp(`^${category}$`, 'i') };
    if (published !== undefined) filter.published = published === 'true';
    if (featured !== undefined) filter.featured = featured === 'true';
    if (minPrice || maxPrice) {
      filter.unitPrice = {};
      if (minPrice) filter.unitPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.unitPrice.$lte = parseFloat(maxPrice);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).sort(sort).lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message,
    });
  }
};

// -------------------------------
// 3. GET a single product (super‑admin only – no storeId)
// -------------------------------
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message,
    });
  }
};

// -------------------------------
// 4. UPDATE a product (super‑admin only – no storeId)
// -------------------------------
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    let updateData = { ...req.body };

    if (req.files?.thumbnail?.[0]?.filename) updateData.thumbnail = req.files.thumbnail[0].filename;
    if (req.files?.metaImage?.[0]?.filename) updateData.metaImage = req.files.metaImage[0].filename;
    if (req.files?.galleryImages?.length) updateData.galleryImages = req.files.galleryImages.map(f => f.filename);

    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const arrayFields = ['relatedCategories', 'tags', 'attributes', 'frequentlyBought'];
    arrayFields.forEach(field => {
      if (typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch {
          updateData[field] = [];
        }
      }
    });

    const boolFields = ['published', 'featured', 'todaysDeal', 'refundable', 'freeShipping', 'flatRate', 'quantityMultiply', 'codAvailable'];
    boolFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field] === 'true' || updateData[field] === true;
      }
    });

    const numFields = ['weight', 'minPurchaseQty', 'unitPrice', 'discount', 'stock', 'lowStockWarning', 'quantity', 'gstRate'];
    numFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = Number(updateData[field]) || 0;
      }
    });

    if (updateData.attributes && Array.isArray(updateData.attributes)) {
      updateData.attributes = updateData.attributes.map(attr => ({
        name: attr.name,
        values: attr.values.map(v => {
          if (typeof v === 'string') return { value: v, packSizes: [] };
          return {
            value: v.value,
            packSizes: Array.isArray(v.packSizes) ? v.packSizes : []
          };
        })
      }));
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message,
    });
  }
};

// -------------------------------
// 5. DELETE a product (super‑admin only – no storeId)
// -------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id).lean();
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Also delete any store overrides for this product
    await StoreProductOverride.deleteMany({ productId: id });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message,
    });
  }
};

// -------------------------------
// STORE PRODUCT OVERRIDE CONTROLLERS
// -------------------------------

export const getStoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'storeId query parameter is required' });
    }
    const master = await Product.findById(id).lean();
    if (!master) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const override = await StoreProductOverride.findOne({ storeId, productId: id }).lean();
    const merged = { ...master, ...(override?.overrides || {}), published: master.published };
    res.status(200).json({ success: true, data: merged });
  } catch (error) {
    console.error('Error in getStoreProduct:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching store product' });
  }
};

export const updateStoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'storeId query parameter is required' });
    }
    const updates = req.body;
    const overrides = {};
    for (const field of STORE_OVERRIDE_ALLOWED_FIELDS) {
      if (updates[field] !== undefined) overrides[field] = updates[field];
    }
    if (Object.keys(overrides).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    await StoreProductOverride.findOneAndUpdate(
      { storeId, productId: id },
      { $set: { overrides } },
      { upsert: true, new: true }
    );
    const master = await Product.findById(id).lean();
    const updatedOverride = await StoreProductOverride.findOne({ storeId, productId: id }).lean();
    const merged = { ...master, ...(updatedOverride?.overrides || {}), published: master.published };
    res.status(200).json({
      success: true,
      message: 'Store product updated successfully',
      data: merged,
    });
  } catch (error) {
    console.error('Error in updateStoreProduct:', error);
    res.status(500).json({ success: false, message: 'Server error while updating store product' });
  }
};

export const deleteStoreOverride = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'storeId query parameter is required' });
    }
    const result = await StoreProductOverride.findOneAndDelete({ storeId, productId: id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'No override found for this product and store' });
    }
    res.status(200).json({ success: true, message: 'Store override deleted. Product reverted to master.' });
  } catch (error) {
    console.error('Error in deleteStoreOverride:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting store override' });
  }
};

export const getAllStoreProducts = async (req, res) => {
  try {
    const { storeId } = req.query;
    if (!storeId) return res.status(400).json({ success: false, message: 'storeId required' });

    // 👇 Only overrides with enabled: true
    const enabledOverrides = await StoreProductOverride.find({ storeId, enabled: true }).lean();
    const productIds = enabledOverrides.map(o => o.productId);
    const masters = await Product.find({ _id: { $in: productIds } }).lean();

    const overrideMap = {};
    enabledOverrides.forEach(ov => {
      overrideMap[ov.productId.toString()] = ov.overrides;
    });

    const merged = masters.map(master => ({
      ...master,
      ...(overrideMap[master._id.toString()] || {}),
      published: master.published,
    }));

    res.json({ success: true, data: merged });
  } catch (error) {
    console.error('Error in getAllStoreProducts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleProductAccessForStore = async (req, res) => {
  try {
    const { productId, storeId } = req.params;
    const { enabled } = req.body;
    const override = await StoreProductOverride.findOneAndUpdate(
      { storeId, productId },
      { $set: { enabled } },
      { upsert: true, new: true }
    );
    res.json({
      success: true,
      message: `Product ${enabled ? 'enabled' : 'disabled'} for store`,
      data: override,
    });
  } catch (error) {
    console.error('Error in toggleProductAccessForStore:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentStore = async (req, res) => {
  try {
    const storeId = req.user?.storeId;
    if (!storeId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    res.json({ success: true, storeId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= NEW: Get store by email =================
// export const getStoreByEmail = async (req, res) => {
//   try {
//     const { email } = req.query;
//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email query parameter is required' });
//     }
//     const store = await MedicalStore.findOne({ emailAddress: email.toLowerCase() }).lean();
//     if (!store) {
//       return res.status(404).json({ success: false, message: 'No store found with this email' });
//     }
//     res.json({
//       success: true,
//       storeId: store._id,
//       storeName: store.storeName,
//       email: store.emailAddress
//     });
//   } catch (error) {
//     console.error('Error in getStoreByEmail:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };