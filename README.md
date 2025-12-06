# Retail Sales Management System - Backend

Backend API service for the Retail Sales Management System.

## Features

- RESTful API for transaction data
- Search by customer name or phone number
- Multi-criteria filtering (region, gender, age, category, tags, payment method, date range)
- Sorting by date, quantity, or customer name
- Pagination support
- Dataset caching for faster startup

## Tech Stack

- Node.js with Express
- CSV parsing with csv-parser
- Axios for HTTP requests
- In-memory data storage
- File-based caching

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Download and cache the dataset (first time only):
```bash
npm run download-dataset
```

This will download the 224MB dataset from Google Drive and cache it locally in `backend/data/dataset.csv`. The download takes a few minutes but only needs to be done once.

4. Start the development server:
```bash
npm run dev
```

The server will start on port 3000 and load the dataset from cache (much faster than downloading each time).

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run download-dataset` - Download and cache the dataset from Google Drive

## API Endpoints

### GET /api/transactions

Get transactions with search, filter, sort, and pagination.

**Query Parameters:**
- `search` (string) - Search by customer name or phone number
- `customerRegion` (string[]) - Filter by customer regions (comma-separated)
- `gender` (string[]) - Filter by gender (comma-separated)
- `ageMin` (number) - Minimum age filter
- `ageMax` (number) - Maximum age filter
- `productCategory` (string[]) - Filter by product categories (comma-separated)
- `tags` (string[]) - Filter by tags (comma-separated)
- `paymentMethod` (string[]) - Filter by payment methods (comma-separated)
- `dateStart` (string) - Start date filter (YYYY-MM-DD)
- `dateEnd` (string) - End date filter (YYYY-MM-DD)
- `sortBy` (string) - Sort field: `date`, `quantity`, `customerName`
- `order` (string) - Sort order: `asc`, `desc`
- `page` (number) - Page number (default: 1)
- `pageSize` (number) - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 100000,
    "totalItems": 1000000,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### GET /api/filters

Get unique values for filter dropdowns.

**Response:**
```json
{
  "success": true,
  "data": {
    "customerRegion": ["Central", "East", "North", "South", "West"],
    "gender": ["Female", "Male"],
    "productCategory": ["Beauty", "Clothing", "Electronics"],
    "tags": [...],
    "paymentMethod": [...]
  }
}
```

### GET /health

Health check endpoint with dataset statistics.

**Response:**
```json
{
  "status": "ok",
  "datasetLoaded": true,
  "stats": {
    "loaded": true,
    "totalTransactions": 1000000,
    "dateRange": {
      "start": "2021-01-01",
      "end": "2023-09-28"
    },
    "totalAmount": 7577394604,
    "totalDiscount": 0
  }
}
```

## Dataset Caching

The backend uses a file-based caching system to avoid downloading the large dataset on every server restart:

- **First run**: Downloads dataset from Google Drive and caches it in `backend/data/dataset.csv`
- **Subsequent runs**: Loads dataset from cached file (much faster)
- **Cache location**: `backend/data/dataset.csv` (224MB)
- **Force re-download**: Run `npm run download-dataset` to clear cache and download fresh data

The cache file is automatically excluded from git via `.gitignore`.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATASET_URL` - Google Drive URL for the dataset

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # Entry point
├── data/                # Cached dataset (gitignored)
├── scripts/             # Utility scripts
└── package.json
```

## Performance

- **Dataset size**: 1,000,000 transactions
- **Memory usage**: ~500MB (in-memory storage)
- **Startup time**: 
  - With cache: ~10-15 seconds
  - Without cache: ~2-3 minutes (first download)
- **API response time**: <100ms for most queries
