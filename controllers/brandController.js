import Brand from '../model/Brand.js';


// Helper to get file URL (if Multer saves to /imgUploads)
const getLogoUrl = (file) => {
  if (!file) return null;
  return `/imgUploads/${file.filename}`;
};

// -------------------------------
// 1. GET all brands
// -------------------------------
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------------------
// 2. GET single brand by ID
// -------------------------------
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------------------
// 3. CREATE a new brand
// -------------------------------
export const createBrand = async (req, res) => {
  try {
    const { name, category, metaTitle, metaDescription, metaKeywords } = req.body;
    const logo = req.file ? getLogoUrl(req.file) : null;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Brand name is required' });
    }

    // Check for duplicate name
    const existing = await Brand.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Brand already exists' });
    }

    const newBrand = new Brand({
      name: name.trim(),
      logo,
      category: category || 'General',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      metaKeywords: metaKeywords || '',
    });

    const savedBrand = await newBrand.save();
    res.status(201).json({ success: true, data: savedBrand });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------------------
// 4. UPDATE an existing brand
// -------------------------------
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, metaTitle, metaDescription, metaKeywords } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (category) updateData.category = category;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;

    // If a new logo file is uploaded, update it
    if (req.file) {
      updateData.logo = getLogoUrl(req.file);
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBrand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    res.status(200).json({ success: true, data: updatedBrand });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------------------
// 5. DELETE a brand
// -------------------------------
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBrand = await Brand.findByIdAndDelete(id);
    if (!deletedBrand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, message: 'Brand deleted successfully', data: deletedBrand });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};