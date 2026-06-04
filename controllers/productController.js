// controllers/productController.js
import Product from '../model/AddProductPageModel.js';

// -------------------------------
// 1. CREATE a new product
// -------------------------------
export const addProduct = async (req, res) => {
  try {
    // Extract files
    const thumbnail = req.files?.thumbnail?.[0]?.filename || '';
    const metaImage = req.files?.metaImage?.[0]?.filename || '';
    const galleryImages = req.files?.galleryImages?.map(f => f.filename) || [];

    // Extract all text fields
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

    // ========== PARSE JSON strings (coming from FormData) ==========
    if (typeof relatedCategories === 'string') {
      try { relatedCategories = JSON.parse(relatedCategories); } catch(e) { relatedCategories = []; }
    }
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch(e) { tags = []; }
    }
    if (typeof attributes === 'string') {
      try { attributes = JSON.parse(attributes); } catch(e) { attributes = []; }
    }
    if (typeof frequentlyBought === 'string') {
      try { frequentlyBought = JSON.parse(frequentlyBought); } catch(e) { frequentlyBought = []; }
    }

    // Ensure arrays
    relatedCategories = Array.isArray(relatedCategories) ? relatedCategories : [];
    tags = Array.isArray(tags) ? tags : [];
    attributes = Array.isArray(attributes) ? attributes : [];
    frequentlyBought = Array.isArray(frequentlyBought) ? frequentlyBought : [];

    // ========== VALIDATE MANDATORY FIELDS (tags is NOT mandatory) ==========
    const missingFields = [];
    if (!productName) missingFields.push('productName');
    if (!mainCategory) missingFields.push('mainCategory');
    if (!brand) missingFields.push('brand');
    if (!relatedCategories || relatedCategories.length === 0) missingFields.push('relatedCategories');
    if (!unit) missingFields.push('unit');
    if (weight === undefined || weight === '') missingFields.push('weight');
    if (!minPurchaseQty) missingFields.push('minPurchaseQty');
    // tags are optional – no validation

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing mandatory fields: ${missingFields.join(', ')}`,
      });
    }

    // Convert numeric fields
    const toNumber = (val, def = 0) => {
      const num = Number(val);
      return isNaN(num) ? def : num;
    };

    // Build product data
    const productData = {
      productName: productName.trim(),
      mainCategory: mainCategory.trim(),
      brand: brand.trim(),
      relatedCategories,
      unit: unit.trim(),
      weight: toNumber(weight, 0),
      minPurchaseQty: toNumber(minPurchaseQty, 1),
      tags, // optional – may be empty array
      published: published !== undefined ? (published === 'true' || published === true) : true,
      featured: featured === 'true' || featured === true,
      todaysDeal: todaysDeal === 'true' || todaysDeal === true,
      refundable: refundable === 'true' || refundable === true,
      refundNote: refundNote || 'This product is eligible for return within 7 days of delivery.',
      thumbnail,
      galleryImages,
      description: description || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      metaImage,
      freeShipping: freeShipping !== undefined ? (freeShipping === 'true' || freeShipping === true) : true,
      flatRate: flatRate === 'true' || flatRate === true,
      quantityMultiply: quantityMultiply === 'true' || quantityMultiply === true,
      shippingDays: shippingDays || '',
      shippingNote: shippingNote || 'This product is shipped within 2-3 business days.',
      codAvailable: codAvailable === 'true' || codAvailable === true,
      codNote: codNote || 'Cash on delivery available for orders within India.',
      attributes,
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
// 2. GET all products (with filters, pagination, search)
// -------------------------------
export const getAllProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, category, minPrice, maxPrice, published, featured, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;
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
    
    // 🔧 FIX: Case‑insensitive category matching
    if (category) {
      filter.mainCategory = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    
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
// 3. GET a single product by ID
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
// 4. UPDATE a product by ID
// -------------------------------
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }

    let updateData = { ...req.body };

    if (req.files?.thumbnail?.[0]?.filename) {
      updateData.thumbnail = req.files.thumbnail[0].filename;
    }
    if (req.files?.metaImage?.[0]?.filename) {
      updateData.metaImage = req.files.metaImage[0].filename;
    }
    if (req.files?.galleryImages?.length) {
      updateData.galleryImages = req.files.galleryImages.map(f => f.filename);
    }

    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Parse JSON strings if present (for arrays)
    const arrayFields = ['relatedCategories', 'tags', 'attributes', 'frequentlyBought'];
    arrayFields.forEach(field => {
      if (typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          updateData[field] = [];
        }
      }
    });

    // Convert boolean/numeric strings
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
// 5. DELETE a product by ID
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