import express from 'express';
const router = express.Router();
import upload from '../middlewares/upload.js';
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  getSubCategoryByName,
  updateSubCategory,
} from '../controllers/subcategory.controller.js';
import {
  subCategoryValidation,
  idValidation,
  nameValidation,
} from '../utils/validators.js';

/**
 * @route   POST /api/subcategories
 * @desc    Create a new subcategory under a category
 * @access  Public
 */
router.post('/', upload.single('image'), subCategoryValidation.create, createSubCategory);

/**
 * @route   GET /api/subcategories
 * @desc    Get all subcategories
 * @access  Public
 */
router.get('/', getAllSubCategories);

/**
 * @route   GET /api/subcategories/category/:categoryId
 * @desc    Get all subcategories under a specific category
 * @access  Public
 */
router.get('/category/:categoryId', idValidation, getSubCategoriesByCategory);

/**
 * @route   GET /api/subcategories/search/:name
 * @desc    Get subcategory by name (case-insensitive)
 * @access  Public
 */
router.get('/search/:name', nameValidation, getSubCategoryByName);

/**
 * @route   GET /api/subcategories/:id
 * @desc    Get subcategory by ID
 * @access  Public
 */
router.get('/:id', idValidation, getSubCategoryById);

/**
 * @route   PUT /api/subcategories/:id
 * @desc    Update subcategory
 * @access  Public
 */
router.put('/:id', upload.single('image'), subCategoryValidation.update, updateSubCategory);

export default router;
