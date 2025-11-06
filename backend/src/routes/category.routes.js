import express from 'express';
const router = express.Router();
import upload from '../middlewares/upload.js';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory,
} from '../controllers/category.controller.js';
import {
  categoryValidation,
  idValidation,
  nameValidation,
} from '../utils/validators.js';

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Public
 */
router.post('/', upload.single('image'), categoryValidation.create, createCategory);

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getAllCategories);

/**
 * @route   GET /api/categories/search/:name
 * @desc    Get category by name (case-insensitive)
 * @access  Public
 */
router.get('/search/:name', nameValidation, getCategoryByName);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', idValidation, getCategoryById);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Public
 */
router.put('/:id', upload.single('image'), categoryValidation.update, updateCategory);

export default router;
