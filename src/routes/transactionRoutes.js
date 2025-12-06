import express from 'express';
import { getTransactionsController, getFilterOptionsController } from '../controllers/transactionController.js';

const router = express.Router();

/**
 * GET /api/transactions
 * Get transactions with search, filter, sort, and pagination
 * Query parameters:
 * - search: string (customer name or phone number)
 * - customerRegion: array of strings
 * - gender: array of strings
 * - ageMin: number
 * - ageMax: number
 * - productCategory: array of strings
 * - tags: array of strings
 * - paymentMethod: array of strings
 * - dateStart: date string (YYYY-MM-DD)
 * - dateEnd: date string (YYYY-MM-DD)
 * - sortBy: string (date, quantity, customerName)
 * - order: string (asc, desc)
 * - page: number (default: 1)
 * - pageSize: number (default: 10)
 */
router.get('/transactions', getTransactionsController);

/**
 * GET /api/filters
 * Get unique values for filter dropdowns
 */
router.get('/filters', getFilterOptionsController);

export default router;
