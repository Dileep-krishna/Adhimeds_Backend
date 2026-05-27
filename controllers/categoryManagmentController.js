import Category from "../model/categorymanagmentModel.js";

// ================= CREATE CATEGORY =================
export const createCategory = async (req, res) => {
  try {
    const { name, type, parent, order, isFeatured, status, metaTitle, metaDescription } = req.body;

    const newCategory = new Category({
      name,
      type,
      parent: parent || null,
      order,
      isFeatured,
      status,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      icon: req.files?.icon?.[0]?.filename || "",
      coverImage: req.files?.coverImage?.[0]?.filename || "",
      banner: req.files?.banner?.[0]?.filename || "",   // NEW: banner upload
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL CATEGORIES =================
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parent", "name")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SINGLE CATEGORY =================
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate("parent", "name");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE CATEGORY =================
export const updateCategory = async (req, res) => {
  try {
    const { name, type, parent, order, isFeatured, status, metaTitle, metaDescription } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update text fields (keeping existing logic, but using nullish coalescing for falsy values)
    category.name = name ?? category.name;
    category.type = type ?? category.type;
    category.parent = parent ?? category.parent;
    category.order = order ?? category.order;
    category.isFeatured = isFeatured ?? category.isFeatured;
    category.status = status ?? category.status;
    category.metaTitle = metaTitle ?? category.metaTitle;
    category.metaDescription = metaDescription ?? category.metaDescription;

    // IMAGE UPDATES (icon, coverImage, banner)
    if (req.files?.icon) {
      category.icon = req.files.icon[0].filename;
    }
    if (req.files?.coverImage) {
      category.coverImage = req.files.coverImage[0].filename;
    }
    if (req.files?.banner) {               // NEW: banner update
      category.banner = req.files.banner[0].filename;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE CATEGORY =================
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};