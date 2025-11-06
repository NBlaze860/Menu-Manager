import { body, param, query } from 'express-validator';

/**
 * Validation rules for category creation and updates
 */
const categoryValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 100 })
      .withMessage('Category name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('taxApplicability')
      .optional()
      .isBoolean()
      .withMessage('Tax applicability must be a boolean'),
    body('tax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax must be a non-negative number'),
    body('taxType')
      .optional()
      .isIn(['percentage', 'fixed'])
      .withMessage('Tax type must be either percentage or fixed'),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid category ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Category name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('taxApplicability')
      .optional()
      .isBoolean()
      .withMessage('Tax applicability must be a boolean'),
    body('tax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax must be a non-negative number'),
    body('taxType')
      .optional()
      .isIn(['percentage', 'fixed'])
      .withMessage('Tax type must be either percentage or fixed'),
  ],
};

/**
 * Validation rules for subcategory creation and updates
 */
const subCategoryValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Subcategory name is required')
      .isLength({ max: 100 })
      .withMessage('Subcategory name cannot exceed 100 characters'),
    body('categoryId')
      .notEmpty()
      .withMessage('Category ID is required')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('taxApplicability')
      .optional()
      .isBoolean()
      .withMessage('Tax applicability must be a boolean'),
    body('tax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax must be a non-negative number'),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid subcategory ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Subcategory name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Subcategory name cannot exceed 100 characters'),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('taxApplicability')
      .optional()
      .isBoolean()
      .withMessage('Tax applicability must be a boolean'),
    body('tax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax must be a non-negative number'),
  ],
};

/**
 * Validation rules for item creation and updates
 */
const itemValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Item name is required')
      .isLength({ max: 100 })
      .withMessage('Item name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('taxApplicability')
      .notEmpty()
      .withMessage('Tax applicability is required')
      .isBoolean()
      .withMessage('Tax applicability must be a boolean'),
    body('tax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax must be a non-negative number'),
    body('baseAmount')
      .notEmpty()
      .withMessage('Base amount is required')
      .isFloat({ min: 0 })
      .withMessage('Base amount must be a non-negative number'),
    body('discount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Discount must be a non-negative number'),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('subCategoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid subcategory ID'),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid item ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Item name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Item name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('taxApplicability')
      .optional()
      .isBoolean()
      .withMessage('Tax applicability must be a boolean'),
    body('tax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Tax must be a non-negative number'),
    body('baseAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Base amount must be a non-negative number'),
    body('discount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Discount must be a non-negative number'),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('subCategoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid subcategory ID'),
  ],
};

/**
 * Validation for MongoDB ObjectId parameters
 */
const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

/**
 * Validation for name search parameters
 */
const nameValidation = [
  param('name')
    .trim()
    .notEmpty()
    .withMessage('Search name is required'),
];

/**
 * Validation for search query
 */
const searchValidation = [
  query('name')
    .trim()
    .notEmpty()
    .withMessage('Search query is required'),
];

export {
  categoryValidation,
  subCategoryValidation,
  itemValidation,
  idValidation,
  nameValidation,
  searchValidation,
};
