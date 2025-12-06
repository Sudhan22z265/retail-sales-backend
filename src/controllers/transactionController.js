import { getTransactions, getUniqueFilterValues } from '../services/transactionService.js';
import { validateQueryParams, sanitizeInput, parseArrayParam, parseNumericParam } from '../utils/validators.js';

/**
 * Controller for getting transactions with search, filter, sort, and pagination
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export async function getTransactionsController(req, res) {
    try {
        // Sanitize search query
        const search = req.query.search ? sanitizeInput(req.query.search) : undefined;

        // Parse array parameters
        const customerRegion = parseArrayParam(req.query.customerRegion);
        const gender = parseArrayParam(req.query.gender);
        const productCategory = parseArrayParam(req.query.productCategory);
        const tags = parseArrayParam(req.query.tags);
        const paymentMethod = parseArrayParam(req.query.paymentMethod);

        // Parse numeric parameters
        const ageMin = parseNumericParam(req.query.ageMin);
        const ageMax = parseNumericParam(req.query.ageMax);
        const page = parseNumericParam(req.query.page, 1);
        const pageSize = parseNumericParam(req.query.pageSize, 10);

        // Parse date parameters
        const dateStart = req.query.dateStart;
        const dateEnd = req.query.dateEnd;

        // Parse sort parameters
        const sortBy = req.query.sortBy || 'date';
        const order = req.query.order || 'desc';

        // Build params object
        const params = {
            search,
            customerRegion,
            gender,
            ageMin,
            ageMax,
            productCategory,
            tags,
            paymentMethod,
            dateStart,
            dateEnd,
            sortBy,
            order,
            page,
            pageSize
        };

        // Validate query parameters
        const validation = validateQueryParams(params);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameters',
                details: validation.errors
            });
        }

        // Get transactions
        const result = getTransactions(params);

        // Return response
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error in getTransactionsController:', error);

        if (error.message.includes('Dataset not loaded')) {
            return res.status(503).json({
                success: false,
                error: 'Service temporarily unavailable',
                message: 'Dataset is still loading. Please try again in a moment.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

/**
 * Controller for getting filter options
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export async function getFilterOptionsController(req, res) {
    try {
        const filterOptions = getUniqueFilterValues();

        res.json({
            success: true,
            data: filterOptions
        });

    } catch (error) {
        console.error('Error in getFilterOptionsController:', error);

        if (error.message.includes('Dataset not loaded')) {
            return res.status(503).json({
                success: false,
                error: 'Service temporarily unavailable',
                message: 'Dataset is still loading. Please try again in a moment.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
