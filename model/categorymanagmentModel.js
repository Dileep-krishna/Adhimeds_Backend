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
      type: String, // image filename or URL
      default: "",
    },

    coverImage: {
      type: String, // image filename or URL
      default: "",
    },

    // NEW FIELD: Banner image (150x150)
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

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // NEW FIELD: SEO meta title
    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    // NEW FIELD: SEO meta description
    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;