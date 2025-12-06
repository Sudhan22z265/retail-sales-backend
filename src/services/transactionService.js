import { dataService } from './dataService.js';

/**
 * Searches transactions by customer name or phone number (case-insensitive)
 * @param {Array} transactions - Transactions to search
 * @param {string} query - Search query
 * @returns {Array} Filtered transactions
 */
export function searchTransactions(transactions, query) {
    if (!query || query.trim() === '') {
        return transactions;
    }

    const searchTerm = query.toLowerCase().trim();

    return transactions.filter(transaction => {
        const customerName = (transaction.customerName || '').toLowerCase();
        const phoneNumber = (transaction.phoneNumber || '').toLowerCase();

        return customerName.includes(searchTerm) || phoneNumber.includes(searchTerm);
    });
}

/**
 * Filters transactions based on multiple criteria (AND logic)
 * @param {Array} transactions - Transactions to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered transactions
 */
export function filterTransactions(transactions, filters) {
    let filtered = [...transactions];

    // Customer Region filter (multi-select)
    if (filters.customerRegion && filters.customerRegion.length > 0) {
        filtered = filtered.filter(t =>
            filters.customerRegion.includes(t.customerRegion)
        );
    }

    // Gender filter (multi-select)
    if (filters.gender && filters.gender.length > 0) {
        filtered = filtered.filter(t =>
            filters.gender.includes(t.gender)
        );
    }

    // Age Range filter
    if (filters.ageMin !== undefined && filters.ageMin !== null) {
        filtered = filtered.filter(t =>
            t.age !== null && t.age >= filters.ageMin
        );
    }
    if (filters.ageMax !== undefined && filters.ageMax !== null) {
        filtered = filtered.filter(t =>
            t.age !== null && t.age <= filters.ageMax
        );
    }

    // Product Category filter (multi-select)
    if (filters.productCategory && filters.productCategory.length > 0) {
        filtered = filtered.filter(t =>
            filters.productCategory.includes(t.productCategory)
        );
    }

    // Tags filter (multi-select) - transaction must have at least one matching tag
    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(t =>
            t.tags.some(tag => filters.tags.includes(tag))
        );
    }

    // Payment Method filter (multi-select)
    if (filters.paymentMethod && filters.paymentMethod.length > 0) {
        filtered = filtered.filter(t =>
            filters.paymentMethod.includes(t.paymentMethod)
        );
    }

    // Date Range filter
    if (filters.dateStart) {
        const startDate = new Date(filters.dateStart);
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate;
        });
    }
    if (filters.dateEnd) {
        const endDate = new Date(filters.dateEnd);
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate <= endDate;
        });
    }

    return filtered;
}

/**
 * Sorts transactions based on specified field and order
 * @param {Array} transactions - Transactions to sort
 * @param {string} sortBy - Field to sort by (date, quantity, customerName)
 * @param {string} order - Sort order (asc, desc)
 * @returns {Array} Sorted transactions
 */
export function sortTransactions(transactions, sortBy = 'date', order = 'desc') {
    const sorted = [...transactions];

    sorted.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'date':
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                comparison = dateA - dateB;
                break;

            case 'quantity':
                comparison = a.quantity - b.quantity;
                break;

            case 'customerName':
                comparison = (a.customerName || '').localeCompare(b.customerName || '');
                break;

            default:
                comparison = 0;
        }

        return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
}

/**
 * Paginates transactions
 * @param {Array} transactions - Transactions to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Object} Paginated result with data and metadata
 */
export function paginateTransactions(transactions, page = 1, pageSize = 10) {
    const totalItems = transactions.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const data = transactions.slice(startIndex, endIndex);

    return {
        data,
        pagination: {
            currentPage,
            pageSize,
            totalPages,
            totalItems,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
        }
    };
}

/**
 * Gets unique values for filter dropdowns
 * @returns {Object} Unique filter values
 */
export function getUniqueFilterValues() {
    const dataset = dataService.getDataset();

    const uniqueValues = {
        customerRegion: [...new Set(dataset.map(t => t.customerRegion).filter(Boolean))].sort(),
        gender: [...new Set(dataset.map(t => t.gender).filter(Boolean))].sort(),
        productCategory: [...new Set(dataset.map(t => t.productCategory).filter(Boolean))].sort(),
        tags: [...new Set(dataset.flatMap(t => t.tags))].sort(),
        paymentMethod: [...new Set(dataset.map(t => t.paymentMethod).filter(Boolean))].sort()
    };

    return uniqueValues;
}

/**
 * Main function to get transactions with all filters, search, sort, and pagination applied
 * @param {Object} params - Query parameters
 * @returns {Object} Result with data and pagination
 */
export function getTransactions(params = {}) {
    let transactions = dataService.getDataset();

    // Apply search
    if (params.search) {
        transactions = searchTransactions(transactions, params.search);
    }

    // Apply filters
    const filters = {
        customerRegion: params.customerRegion,
        gender: params.gender,
        ageMin: params.ageMin,
        ageMax: params.ageMax,
        productCategory: params.productCategory,
        tags: params.tags,
        paymentMethod: params.paymentMethod,
        dateStart: params.dateStart,
        dateEnd: params.dateEnd
    };
    transactions = filterTransactions(transactions, filters);

    // Apply sorting
    transactions = sortTransactions(
        transactions,
        params.sortBy || 'date',
        params.order || 'desc'
    );

    // Apply pagination
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 10;
    const result = paginateTransactions(transactions, page, pageSize);

    return result;
}
