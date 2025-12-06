/**
 * Validates query parameters for transaction API
 * @param {Object} query - Query parameters
 * @returns {Object} Validation result with errors array
 */
export function validateQueryParams(query) {
    const errors = [];

    // Validate age range
    if (query.ageMin !== undefined && query.ageMax !== undefined) {
        const ageMin = parseInt(query.ageMin);
        const ageMax = parseInt(query.ageMax);

        if (!isNaN(ageMin) && !isNaN(ageMax) && ageMin > ageMax) {
            errors.push('ageMin cannot be greater than ageMax');
        }
    }

    // Validate date range
    if (query.dateStart && query.dateEnd) {
        const startDate = new Date(query.dateStart);
        const endDate = new Date(query.dateEnd);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
            errors.push('dateStart cannot be after dateEnd');
        }
    }

    // Validate page number
    if (query.page !== undefined) {
        const page = parseInt(query.page);
        if (isNaN(page) || page < 1) {
            errors.push('page must be a positive integer');
        }
    }

    // Validate page size
    if (query.pageSize !== undefined) {
        const pageSize = parseInt(query.pageSize);
        if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
            errors.push('pageSize must be between 1 and 100');
        }
    }

    // Validate sort field
    if (query.sortBy !== undefined) {
        const validSortFields = ['date', 'quantity', 'customerName'];
        if (!validSortFields.includes(query.sortBy)) {
            errors.push(`sortBy must be one of: ${validSortFields.join(', ')}`);
        }
    }

    // Validate sort order
    if (query.order !== undefined) {
        const validOrders = ['asc', 'desc'];
        if (!validOrders.includes(query.order)) {
            errors.push(`order must be one of: ${validOrders.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Sanitizes user input to prevent injection attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 200); // Limit length
}

/**
 * Parses array parameters from query string
 * @param {string|Array} param - Parameter value
 * @returns {Array} Parsed array
 */
export function parseArrayParam(param) {
    if (!param) return [];
    if (Array.isArray(param)) return param;
    if (typeof param === 'string') {
        return param.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
}

/**
 * Parses numeric parameters
 * @param {string|number} param - Parameter value
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number|null} Parsed number or null
 */
export function parseNumericParam(param, defaultValue = null) {
    if (param === undefined || param === null || param === '') {
        return defaultValue;
    }
    const parsed = Number(param);
    return isNaN(parsed) ? defaultValue : parsed;
}
