import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
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
    taxApplicability: {
      type: Boolean,
      required: [true, 'Tax applicability is required'],
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
      validate: {
        validator: function (value) {
          // If tax applicability is true, tax must be provided
          if (this.taxApplicability && (value === null || value === undefined)) {
            return false;
          }
          return true;
        },
        message: 'Tax value is required when tax applicability is enabled',
      },
    },
    baseAmount: {
      type: Number,
      required: [true, 'Base amount is required'],
      min: [0, 'Base amount cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      validate: {
        validator: function (value) {
          // Discount cannot exceed base amount
          return value <= this.baseAmount;
        },
        message: 'Discount cannot exceed base amount',
      },
    },
    totalAmount: {
      type: Number,
      min: [0, 'Total amount cannot be negative'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validate that item belongs to either category or subcategory, but not both or neither
itemSchema.pre('save', function (next) {
  const hasCategory = this.categoryId !== null && this.categoryId !== undefined;
  const hasSubCategory = this.subCategoryId !== null && this.subCategoryId !== undefined;

  // Item must belong to exactly one: either category or subcategory
  if (hasCategory && hasSubCategory) {
    next(new Error('Item cannot belong to both category and subcategory'));
  } else if (!hasCategory && !hasSubCategory) {
    next(new Error('Item must belong to either a category or subcategory'));
  } else {
    next();
  }
});

// Calculate total amount before saving
// This ensures the calculation is always accurate and in sync
itemSchema.pre('save', function (next) {
  this.totalAmount = this.baseAmount - this.discount;
  next();
});

// Indexes for efficient querying
itemSchema.index({ categoryId: 1 });
itemSchema.index({ subCategoryId: 1 });
itemSchema.index({ name: 1 });
// Compound index for queries that filter by both category and subcategory
itemSchema.index({ categoryId: 1, subCategoryId: 1 });

export default mongoose.model('Item', itemSchema);
