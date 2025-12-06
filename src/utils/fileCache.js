import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, '../../data');
const CACHE_FILE = path.join(CACHE_DIR, 'dataset.csv');

/**
 * Ensures cache directory exists
 */
function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

/**
 * Checks if cached file exists
 * @returns {boolean}
 */
export function isCached() {
    return fs.existsSync(CACHE_FILE);
}

/**
 * Gets the cached file path
 * @returns {string}
 */
export function getCachedFilePath() {
    return CACHE_FILE;
}

/**
 * Downloads file and saves to cache
 * @param {string} url - Google Drive URL
 * @returns {Promise<string>} Path to cached file
 */
export async function downloadAndCache(url) {
    ensureCacheDir();

    console.log('Downloading dataset from Google Drive...');

    // Extract file ID and create download URL
    const fileId = extractFileId(url);
    const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

    // Download file
    const response = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 120000,
        maxRedirects: 5
    });

    // Save to cache
    const writeStream = fs.createWriteStream(CACHE_FILE);

    return new Promise((resolve, reject) => {
        response.data.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log('Dataset downloaded and cached successfully');
            resolve(CACHE_FILE);
        });

        writeStream.on('error', (error) => {
            reject(new Error(`Failed to cache dataset: ${error.message}`));
        });
    });
}

/**
 * Extracts file ID from Google Drive URL
 * @param {string} url - Google Drive URL
 * @returns {string} File ID
 */
function extractFileId(url) {
    const patterns = [
        /\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/,
        /^([a-zA-Z0-9_-]+)$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    throw new Error('Invalid Google Drive URL format');
}

/**
 * Deletes cached file (useful for forcing re-download)
 */
export function clearCache() {
    if (fs.existsSync(CACHE_FILE)) {
        fs.unlinkSync(CACHE_FILE);
        console.log('Cache cleared');
    }
}

/**
 * Gets cache file stats
 * @returns {Object|null}
 */
export function getCacheStats() {
    if (!isCached()) return null;

    const stats = fs.statSync(CACHE_FILE);
    return {
        size: stats.size,
        sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime
    };
}
