import express from 'express';
const router = express.Router();
import upload from '../middlewares/upload.js';
import {
  createItem,
  getAllItems,
  getItemsByCategory,
  getItemsBySubCategory,
  getItemById,
  getItemByName,
  searchItems,
  updateItem,
} from '../controllers/item.controller.js';
import {
  itemValidation,
  idValidation,
  nameValidation,
  searchValidation,
} from '../utils/validators.js';

/**
 * @route   POST /api/items
 * @desc    Create a new item
 * @access  Public
 */
router.post('/', upload.single('image'), itemValidation.create, createItem);

/**
 * @route   GET /api/items
 * @desc    Get all items
 * @access  Public
 */
router.get('/', getAllItems);

/**
 * @route   GET /api/search/items?name=searchTerm
 * @desc    Search items by name (fuzzy/partial matching)
 * @access  Public
 */
router.get('/search', searchValidation, searchItems);

/**
 * @route   GET /api/items/category/:categoryId
 * @desc    Get all items under a category (including items in subcategories)
 * @access  Public
 */
router.get('/category/:categoryId', idValidation, getItemsByCategory);

/**
 * @route   GET /api/items/subcategory/:subCategoryId
 * @desc    Get all items under a subcategory
 * @access  Public
 */
router.get('/subcategory/:subCategoryId', idValidation, getItemsBySubCategory);

/**
 * @route   GET /api/items/name/:name
 * @desc    Get item by exact name (case-insensitive)
 * @access  Public
 */
router.get('/name/:name', nameValidation, getItemByName);

/**
 * @route   GET /api/items/:id
 * @desc    Get item by ID
 * @access  Public
 */
router.get('/:id', idValidation, getItemById);

/**
 * @route   PUT /api/items/:id
 * @desc    Update item
 * @access  Public
 */
router.put('/:id', upload.single('image'), itemValidation.update, updateItem);

export default router;
