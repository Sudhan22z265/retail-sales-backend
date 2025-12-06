import { downloadAndParseCSV } from '../utils/datasetLoader.js';
import { Transaction } from '../models/Transaction.js';

class DataService {
    constructor() {
        this.dataset = [];
        this.isLoaded = false;
    }

    /**
     * Loads dataset from Google Drive URL
     * @param {string} url - Dataset URL
     * @returns {Promise<void>}
     */
    async loadDataset(url) {
        try {
            console.log('Loading dataset...');
            const rawData = await downloadAndParseCSV(url);

            // Convert to Transaction objects and validate
            this.dataset = rawData
                .map(row => new Transaction(row))
                .filter(transaction => transaction.isValid());

            // Validate dataset structure
            this.validateDataset();

            this.isLoaded = true;
            console.log(`Dataset loaded successfully: ${this.dataset.length} valid transactions`);
        } catch (error) {
            this.isLoaded = false;
            throw new Error(`Failed to load dataset: ${error.message}`);
        }
    }

    /**
     * Returns the loaded dataset
     * @returns {Array<Transaction>} Dataset
     */
    getDataset() {
        if (!this.isLoaded) {
            throw new Error('Dataset not loaded. Please wait for initialization.');
        }
        return this.dataset;
    }

    /**
     * Validates that dataset has required attributes
     * @throws {Error} If validation fails
     */
    validateDataset() {
        if (this.dataset.length === 0) {
            throw new Error('Dataset is empty');
        }

        const requiredFields = [
            'transactionId',
            'customerId',
            'customerName',
            'phoneNumber',
            'gender',
            'age',
            'customerRegion',
            'productId',
            'productName',
            'productCategory',
            'tags',
            'quantity',
            'totalAmount',
            'discount',
            'paymentMethod',
            'date'
        ];

        const sampleTransaction = this.dataset[0];
        const missingFields = requiredFields.filter(
            field => !(field in sampleTransaction)
        );

        if (missingFields.length > 0) {
            throw new Error(`Dataset missing required fields: ${missingFields.join(', ')}`);
        }

        console.log('Dataset validation passed');
    }

    /**
     * Checks if dataset is loaded
     * @returns {boolean} True if loaded
     */
    isDatasetLoaded() {
        return this.isLoaded;
    }

    /**
     * Gets dataset statistics
     * @returns {Object} Statistics
     */
    getStats() {
        if (!this.isLoaded) {
            return { loaded: false };
        }

        return {
            loaded: true,
            totalTransactions: this.dataset.length,
            dateRange: this.getDateRange(),
            totalAmount: this.dataset.reduce((sum, t) => sum + t.totalAmount, 0),
            totalDiscount: this.dataset.reduce((sum, t) => sum + t.discount, 0)
        };
    }

    /**
     * Gets date range of dataset
     * @returns {Object} Date range
     */
    getDateRange() {
        if (this.dataset.length === 0) return null;

        const dates = this.dataset
            .map(t => new Date(t.date))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => a - b);

        if (dates.length === 0) return null;

        return {
            start: dates[0].toISOString().split('T')[0],
            end: dates[dates.length - 1].toISOString().split('T')[0]
        };
    }
}

// Singleton instance
export const dataService = new DataService();
