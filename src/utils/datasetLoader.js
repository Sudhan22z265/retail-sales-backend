import fs from 'fs';
import csv from 'csv-parser';
import { isCached, getCachedFilePath, downloadAndCache, getCacheStats } from './fileCache.js';

/**
 * Downloads and parses CSV dataset from Google Drive URL or uses cached version
 * @param {string} url - Google Drive file URL
 * @returns {Promise<Array>} Parsed dataset as array of objects
 */
export async function downloadAndParseCSV(url) {
    try {
        let filePath;

        // Check if dataset is cached
        if (isCached()) {
            console.log('Using cached dataset...');
            const stats = getCacheStats();
            console.log(`Cache file: ${stats.sizeInMB}MB, last modified: ${stats.modified.toLocaleString()}`);
            filePath = getCachedFilePath();
        } else {
            console.log('No cached dataset found. Downloading...');
            filePath = await downloadAndCache(url);
        }

        // Parse CSV file from local cache
        const results = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    results.push(parseRow(row));
                })
                .on('end', () => {
                    console.log(`Successfully loaded ${results.length} transactions`);
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(new Error(`CSV parsing failed: ${error.message}`));
                });
        });
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Dataset download timeout - please check your connection');
        }
        throw new Error(`Failed to load dataset: ${error.message}`);
    }
}

/**
 * Parses and transforms a CSV row into structured transaction object
 * @param {Object} row - Raw CSV row
 * @returns {Object} Parsed transaction object
 */
function parseRow(row) {
    return {
        // Customer Information
        transactionId: row['Transaction ID'] || row.transactionId,
        customerId: row['Customer ID'] || row.customerId,
        customerName: row['Customer Name'] || row.customerName || '',
        phoneNumber: row['Phone Number'] || row.phoneNumber || '',
        email: row['Email'] || row.email || '',
        gender: row['Gender'] || row.gender || '',
        age: parseInt(row['Age'] || row.age) || null,
        customerRegion: row['Customer Region'] || row.customerRegion || '',

        // Product Information
        productId: row['Product ID'] || row.productId,
        productName: row['Product Name'] || row.productName || '',
        productCategory: row['Product Category'] || row.productCategory || '',
        brand: row['Brand'] || row.brand || '',
        tags: parseTags(row['Tags'] || row.tags),

        // Sales Information
        quantity: parseInt(row['Quantity'] || row.quantity) || 0,
        unitPrice: parseFloat(row['Unit Price'] || row.unitPrice) || 0,
        totalAmount: parseFloat(row['Total Amount'] || row.totalAmount) || 0,
        discount: parseFloat(row['Discount'] || row.discount) || 0,
        paymentMethod: row['Payment Method'] || row.paymentMethod || '',

        // Operational Information
        date: row['Date'] || row.date || '',
        time: row['Time'] || row.time || '',
        storeId: row['Store ID'] || row.storeId,
        storeLocation: row['Store Location'] || row.storeLocation || '',
        salesRepId: row['Sales Rep ID'] || row.salesRepId || '',
        salesRepName: row['Sales Rep Name'] || row.salesRepName || '',

        // Additional Fields
        shippingCost: parseFloat(row['Shipping Cost'] || row.shippingCost) || 0,
        deliveryStatus: row['Delivery Status'] || row.deliveryStatus || '',
        customerSatisfaction: parseFloat(row['Customer Satisfaction'] || row.customerSatisfaction) || null,
        returnStatus: row['Return Status'] || row.returnStatus || ''
    };
}

/**
 * Parses tags from comma-separated string to array
 * @param {string} tagsString - Comma-separated tags
 * @returns {Array<string>} Array of tags
 */
function parseTags(tagsString) {
    if (!tagsString) return [];
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}
