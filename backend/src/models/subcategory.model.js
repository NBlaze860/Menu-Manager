import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      maxlength: [100, 'Subcategory name cannot exceed 100 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Parent category is required'],
    },
    // Tax settings default to parent category but can be overridden
    taxApplicability: {
      type: Boolean,
      default: null, // null means inherit from parent
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
      default: null, // null means inherit from parent
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by category
subCategorySchema.index({ categoryId: 1 });
// Compound index for name searches within a category
subCategorySchema.index({ categoryId: 1, name: 1 });

export default mongoose.model('SubCategory', subCategorySchema);
