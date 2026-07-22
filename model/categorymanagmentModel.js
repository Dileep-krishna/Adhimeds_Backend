import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    icon: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isHot: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // ─── SEO fields ───
    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // ✅ NEW: Meta Keywords (comma-separated string)
    metaKeywords: {
      type: String,
      default: "",
      trim: true,
    },

    // ✅ NEW: Filtering Attributes (array of Attribute IDs)
    // If you have an Attribute model, use ObjectId references:
    filteringAttributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
    ],
    // If you DON'T have an Attribute model, use this instead:
    // filteringAttributes: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;