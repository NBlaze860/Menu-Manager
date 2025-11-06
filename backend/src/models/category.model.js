import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
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
      default: false,
    },
    // Tax value is only meaningful when taxApplicability is true
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
    taxType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
  },
  {
    timestamps: true,
  }
);

// Note: Index on 'name' field is already created via 'unique: true' in schema definition
// No need for redundant categorySchema.index({ name: 1 })

export default mongoose.model('Category', categorySchema);
