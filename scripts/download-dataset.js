import { downloadAndCache, clearCache, getCacheStats } from '../src/utils/fileCache.js';
import dotenv from 'dotenv';

dotenv.config();

const DATASET_URL = process.env.DATASET_URL || 'https://drive.google.com/file/d/1tzbyuxBmrBwMSXbL22r33FUMtO0V_lxb/view?usp=sharing';

async function downloadDataset() {
    try {
        console.log('Clearing existing cache...');
        clearCache();

        console.log('Starting dataset download...');
        console.log('This may take a few minutes for large files...');

        const filePath = await downloadAndCache(DATASET_URL);

        console.log('\nDownload complete!');
        const stats = getCacheStats();
        console.log(`File size: ${stats.sizeInMB}MB`);
        console.log(`Location: ${filePath}`);
        console.log(`Created: ${stats.created.toLocaleString()}`);

    } catch (error) {
        console.error('Download failed:', error.message);
        process.exit(1);
    }
}

downloadDataset();
