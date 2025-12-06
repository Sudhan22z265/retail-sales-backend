import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes.js';
import { dataService } from './services/dataService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATASET_URL = process.env.DATASET_URL || 'https://drive.google.com/file/d/1tzbyuxBmrBwMSXbL22r33FUMtO0V_lxb/view?usp=sharing';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration
const corsOptions = {
    origin: NODE_ENV === 'production'
        ? [FRONTEND_URL]
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        datasetLoaded: dataService.isDatasetLoaded(),
        stats: dataService.getStats()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Retail Sales Management System API',
        version: '1.0.0',
        endpoints: {
            transactions: '/api/transactions',
            filters: '/api/filters',
            health: '/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// Initialize server
async function startServer() {
    try {
        console.log('Starting server...');

        // Load dataset
        await dataService.loadDataset(DATASET_URL);

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}/api`);
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
