import Category from '../models/category.model.js';
import SubCategory from '../models/subcategory.model.js';
import Item from '../models/item.model.js';
import cloudinary from '../config/cloudinary.js';
import { validationResult } from 'express-validator';

/**
 * Helper function to upload image to Cloudinary
 * Converts buffer to base64 and uploads to the menu_categories folder
 */
const uploadToCloudinary = async (fileBuffer, folder = 'menu_categories') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Helper function to delete image from Cloudinary
 * Extracts public_id from URL and deletes the image
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

/**
 * Create a new category
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, description, taxApplicability, tax, taxType } = req.body;

    // Validate that tax is provided when taxApplicability is true
    if (taxApplicability === 'true' || taxApplicability === true) {
      if (!tax || parseFloat(tax) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Tax value is required and must be non-negative when tax applicability is enabled',
        });
      }
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'menu_categories');
      imageUrl = result.secure_url;
    }

    // Create category object
    const categoryData = {
      name,
      description,
      taxApplicability: taxApplicability === 'true' || taxApplicability === true,
      taxType: taxType || 'percentage',
    };

    if (imageUrl) {
      categoryData.image = imageUrl;
    }

    // Only include tax if taxApplicability is true
    if (categoryData.taxApplicability) {
      categoryData.tax = parseFloat(tax);
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by name (case-insensitive search)
 * GET /api/categories/search/:name
 */
const getCategoryByName = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // Case-insensitive search using regex
    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const { name, description, taxApplicability, tax, taxType } = req.body;

    // Update fields if provided
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (taxType) category.taxType = taxType;

    // Handle tax applicability update
    if (taxApplicability !== undefined) {
      const taxApplicabilityBool = taxApplicability === 'true' || taxApplicability === true;
      category.taxApplicability = taxApplicabilityBool;

      // Validate tax when enabling tax applicability
      if (taxApplicabilityBool) {
        if (!tax && category.tax === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Tax value is required when enabling tax applicability',
          });
        }
        if (tax) category.tax = parseFloat(tax);
      } else {
        // Clear tax when disabling tax applicability
        category.tax = undefined;
      }
    } else if (tax !== undefined) {
      // If only tax is updated, validate taxApplicability is enabled
      if (!category.taxApplicability) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set tax value when tax applicability is disabled',
        });
      }
      category.tax = parseFloat(tax);
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (category.image) {
        await deleteFromCloudinary(category.image);
      }
      // Upload new image
      const result = await uploadToCloudinary(req.file.buffer, 'menu_categories');
      category.image = result.secure_url;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory,
};
