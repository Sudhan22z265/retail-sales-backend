/**
 * Transaction model representing a retail sales transaction
 * Contains all 28 attributes from the dataset
 */
export class Transaction {
    constructor(data) {
        // Customer Information
        this.transactionId = data.transactionId;
        this.customerId = data.customerId;
        this.customerName = data.customerName || '';
        this.phoneNumber = data.phoneNumber || '';
        this.email = data.email || '';
        this.gender = data.gender || '';
        this.age = data.age || null;
        this.customerRegion = data.customerRegion || '';

        // Product Information
        this.productId = data.productId;
        this.productName = data.productName || '';
        this.productCategory = data.productCategory || '';
        this.brand = data.brand || '';
        this.tags = Array.isArray(data.tags) ? data.tags : [];

        // Sales Information
        this.quantity = data.quantity || 0;
        this.unitPrice = data.unitPrice || 0;
        this.totalAmount = data.totalAmount || 0;
        this.discount = data.discount || 0;
        this.paymentMethod = data.paymentMethod || '';

        // Operational Information
        this.date = data.date || '';
        this.time = data.time || '';
        this.storeId = data.storeId;
        this.storeLocation = data.storeLocation || '';
        this.salesRepId = data.salesRepId || '';
        this.salesRepName = data.salesRepName || '';

        // Additional Fields
        this.shippingCost = data.shippingCost || 0;
        this.deliveryStatus = data.deliveryStatus || '';
        this.customerSatisfaction = data.customerSatisfaction || null;
        this.returnStatus = data.returnStatus || '';
    }

    /**
     * Validates that required fields are present
     * @returns {boolean} True if valid
     */
    isValid() {
        return !!(
            this.transactionId &&
            this.customerId &&
            this.productId &&
            this.date
        );
    }

    /**
     * Returns a plain object representation
     * @returns {Object} Plain object
     */
    toJSON() {
        return {
            transactionId: this.transactionId,
            customerId: this.customerId,
            customerName: this.customerName,
            phoneNumber: this.phoneNumber,
            email: this.email,
            gender: this.gender,
            age: this.age,
            customerRegion: this.customerRegion,
            productId: this.productId,
            productName: this.productName,
            productCategory: this.productCategory,
            brand: this.brand,
            tags: this.tags,
            quantity: this.quantity,
            unitPrice: this.unitPrice,
            totalAmount: this.totalAmount,
            discount: this.discount,
            paymentMethod: this.paymentMethod,
            date: this.date,
            time: this.time,
            storeId: this.storeId,
            storeLocation: this.storeLocation,
            salesRepId: this.salesRepId,
            salesRepName: this.salesRepName,
            shippingCost: this.shippingCost,
            deliveryStatus: this.deliveryStatus,
            customerSatisfaction: this.customerSatisfaction,
            returnStatus: this.returnStatus
        };
    }
}
