import Item from '../models/item.model.js';
import Category from '../models/category.model.js';
import SubCategory from '../models/subcategory.model.js';
import cloudinary from '../config/cloudinary.js';
import { validationResult } from 'express-validator';

/**
 * Helper function to upload image to Cloudinary
 */
const uploadToCloudinary = async (fileBuffer, folder = 'menu_items') => {
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
 * Create a new item
 * POST /api/items
 */
const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      name,
      description,
      taxApplicability,
      tax,
      baseAmount,
      discount,
      categoryId,
      subCategoryId,
    } = req.body;

    // Validate that item belongs to either category or subcategory, not both or neither
    const hasCategoryId = categoryId && categoryId.trim() !== '';
    const hasSubCategoryId = subCategoryId && subCategoryId.trim() !== '';

    if (hasCategoryId && hasSubCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Item cannot belong to both category and subcategory',
      });
    }

    if (!hasCategoryId && !hasSubCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Item must belong to either a category or subcategory',
      });
    }

    // Verify category or subcategory exists
    if (hasCategoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }
    }

    if (hasSubCategoryId) {
      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found',
        });
      }
    }

    // Validate tax when taxApplicability is true
    const taxApplicabilityBool = taxApplicability === 'true' || taxApplicability === true;
    if (taxApplicabilityBool && (!tax || parseFloat(tax) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Tax value is required and must be non-negative when tax applicability is enabled',
      });
    }

    // Validate discount doesn't exceed base amount
    const baseAmountNum = parseFloat(baseAmount);
    const discountNum = discount ? parseFloat(discount) : 0;

    if (discountNum > baseAmountNum) {
      return res.status(400).json({
        success: false,
        message: 'Discount cannot exceed base amount',
      });
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'menu_items');
      imageUrl = result.secure_url;
    }

    // Create item object
    const itemData = {
      name,
      description,
      taxApplicability: taxApplicabilityBool,
      baseAmount: baseAmountNum,
      discount: discountNum,
    };

    if (imageUrl) {
      itemData.image = imageUrl;
    }

    if (taxApplicabilityBool) {
      itemData.tax = parseFloat(tax);
    }

    if (hasCategoryId) {
      itemData.categoryId = categoryId;
    }

    if (hasSubCategoryId) {
      itemData.subCategoryId = subCategoryId;
    }

    const item = await Item.create(itemData);

    // Populate references in response
    await item.populate([
      { path: 'categoryId' },
      { path: 'subCategoryId' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all items
 * GET /api/items
 */
const getAllItems = async (req, res, next) => {
  try {
    const items = await Item.find()
      .populate('categoryId')
      .populate('subCategoryId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all items under a category (including items in its subcategories)
 * GET /api/items/category/:categoryId
 */
const getItemsByCategory = async (req, res, next) => {
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

    // Get all subcategories under this category
    const subCategories = await SubCategory.find({ categoryId });
    const subCategoryIds = subCategories.map((sub) => sub._id);

    // Find items directly under category OR under its subcategories
    const items = await Item.find({
      $or: [
        { categoryId: categoryId },
        { subCategoryId: { $in: subCategoryIds } },
      ],
    })
      .populate('categoryId')
      .populate('subCategoryId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all items under a subcategory
 * GET /api/items/subcategory/:subCategoryId
 */
const getItemsBySubCategory = async (req, res, next) => {
  try {
    const { subCategoryId } = req.params;

    // Verify subcategory exists
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    const items = await Item.find({ subCategoryId })
      .populate('categoryId')
      .populate('subCategoryId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get item by ID
 * GET /api/items/:id
 */
const getItemById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const item = await Item.findById(req.params.id)
      .populate('categoryId')
      .populate('subCategoryId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get item by name (case-insensitive search)
 * GET /api/items/search/:name
 */
const getItemByName = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const item = await Item.findOne({
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') },
    })
      .populate('categoryId')
      .populate('subCategoryId');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search items by name (fuzzy/partial matching)
 * GET /api/search/items?name=searchTerm
 */
const searchItems = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name } = req.query;

    // Case-insensitive partial match using regex
    const items = await Item.find({
      name: { $regex: name, $options: 'i' },
    })
      .populate('categoryId')
      .populate('subCategoryId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update item
 * PUT /api/items/:id
 */
const updateItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const {
      name,
      description,
      taxApplicability,
      tax,
      baseAmount,
      discount,
      categoryId,
      subCategoryId,
    } = req.body;

    // Update basic fields
    if (name) item.name = name;
    if (description !== undefined) item.description = description;

    // Handle category/subcategory updates
    // Ensure item still belongs to exactly one parent
    if (categoryId !== undefined || subCategoryId !== undefined) {
      const newCategoryId = categoryId !== undefined ? categoryId : item.categoryId;
      const newSubCategoryId = subCategoryId !== undefined ? subCategoryId : item.subCategoryId;

      const hasCategoryId = newCategoryId && newCategoryId.toString().trim() !== '';
      const hasSubCategoryId = newSubCategoryId && newSubCategoryId.toString().trim() !== '';

      if (hasCategoryId && hasSubCategoryId) {
        return res.status(400).json({
          success: false,
          message: 'Item cannot belong to both category and subcategory',
        });
      }

      if (!hasCategoryId && !hasSubCategoryId) {
        return res.status(400).json({
          success: false,
          message: 'Item must belong to either a category or subcategory',
        });
      }

      // Verify new category/subcategory exists
      if (categoryId && categoryId !== item.categoryId?.toString()) {
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Category not found',
          });
        }
        item.categoryId = categoryId;
        item.subCategoryId = null;
      }

      if (subCategoryId && subCategoryId !== item.subCategoryId?.toString()) {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
          return res.status(404).json({
            success: false,
            message: 'Subcategory not found',
          });
        }
        item.subCategoryId = subCategoryId;
        item.categoryId = null;
      }
    }

    // Handle tax applicability update
    if (taxApplicability !== undefined) {
      const taxApplicabilityBool = taxApplicability === 'true' || taxApplicability === true;
      item.taxApplicability = taxApplicabilityBool;

      if (taxApplicabilityBool) {
        if (!tax && item.tax === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Tax value is required when enabling tax applicability',
          });
        }
        if (tax) item.tax = parseFloat(tax);
      } else {
        item.tax = undefined;
      }
    } else if (tax !== undefined) {
      if (!item.taxApplicability) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set tax value when tax applicability is disabled',
        });
      }
      item.tax = parseFloat(tax);
    }

    // Handle amount updates and recalculate total
    if (baseAmount !== undefined) {
      item.baseAmount = parseFloat(baseAmount);
    }

    if (discount !== undefined) {
      const discountNum = parseFloat(discount);
      if (discountNum > item.baseAmount) {
        return res.status(400).json({
          success: false,
          message: 'Discount cannot exceed base amount',
        });
      }
      item.discount = discountNum;
    }

    // Handle image update
    if (req.file) {
      if (item.image) {
        await deleteFromCloudinary(item.image);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'menu_items');
      item.image = result.secure_url;
    }

    // Save will trigger pre-save hook to recalculate totalAmount
    await item.save();
    await item.populate([
      { path: 'categoryId' },
      { path: 'subCategoryId' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createItem,
  getAllItems,
  getItemsByCategory,
  getItemsBySubCategory,
  getItemById,
  getItemByName,
  searchItems,
  updateItem,
};
