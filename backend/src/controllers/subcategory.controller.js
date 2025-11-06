import SubCategory from '../models/subcategory.model.js';
import Category from '../models/category.model.js';
import cloudinary from '../config/cloudinary.js';
import { validationResult } from 'express-validator';

/**
 * Helper function to upload image to Cloudinary
 */
const uploadToCloudinary = async (fileBuffer, folder = 'menu_subcategories') => {
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
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

/**
 * Create a new subcategory under a category
 * POST /api/subcategories
 */
const createSubCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, description, categoryId, taxApplicability, tax } = req.body;

    // Verify parent category exists
    const parentCategory = await Category.findById(categoryId);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found',
      });
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'menu_subcategories');
      imageUrl = result.secure_url;
    }

    // Create subcategory with inherited or explicit tax settings
    const subCategoryData = {
      name,
      description,
      categoryId,
    };

    if (imageUrl) {
      subCategoryData.image = imageUrl;
    }

    // If tax settings not provided, inherit from parent category
    if (taxApplicability !== undefined) {
      subCategoryData.taxApplicability = taxApplicability === 'true' || taxApplicability === true;
      if (subCategoryData.taxApplicability && tax !== undefined) {
        subCategoryData.tax = parseFloat(tax);
      }
    } else {
      // Inherit from parent
      subCategoryData.taxApplicability = parentCategory.taxApplicability;
      subCategoryData.tax = parentCategory.tax;
    }

    const subCategory = await SubCategory.create(subCategoryData);

    // Populate category details in response
    await subCategory.populate('categoryId');

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all subcategories
 * GET /api/subcategories
 */
const getAllSubCategories = async (req, res, next) => {
  try {
    const subCategories = await SubCategory.find()
      .populate('categoryId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all subcategories under a specific category
 * GET /api/subcategories/category/:categoryId
 */
const getSubCategoriesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const subCategories = await SubCategory.find({ categoryId })
      .populate('categoryId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subcategory by ID
 * GET /api/subcategories/:id
 */
const getSubCategoryById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const subCategory = await SubCategory.findById(req.params.id).populate('categoryId');

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subcategory by name (case-insensitive search)
 * GET /api/subcategories/search/:name
 */
const getSubCategoryByName = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const subCategory = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') },
    }).populate('categoryId');

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update subcategory
 * PUT /api/subcategories/:id
 */
const updateSubCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    const { name, description, categoryId, taxApplicability, tax } = req.body;

    // Update fields if provided
    if (name) subCategory.name = name;
    if (description !== undefined) subCategory.description = description;

    // Verify new category exists if updating categoryId
    if (categoryId && categoryId !== subCategory.categoryId.toString()) {
      const newCategory = await Category.findById(categoryId);
      if (!newCategory) {
        return res.status(404).json({
          success: false,
          message: 'New parent category not found',
        });
      }
      subCategory.categoryId = categoryId;
    }

    // Handle tax settings update
    if (taxApplicability !== undefined) {
      subCategory.taxApplicability = taxApplicability === 'true' || taxApplicability === true;
      if (subCategory.taxApplicability && tax !== undefined) {
        subCategory.tax = parseFloat(tax);
      }
    } else if (tax !== undefined) {
      subCategory.tax = parseFloat(tax);
    }

    // Handle image update
    if (req.file) {
      if (subCategory.image) {
        await deleteFromCloudinary(subCategory.image);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'menu_subcategories');
      subCategory.image = result.secure_url;
    }

    await subCategory.save();
    await subCategory.populate('categoryId');

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createSubCategory,
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  getSubCategoryByName,
  updateSubCategory,
};
