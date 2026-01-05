
import degit from 'degit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO = 'freqtrade/freqtrade/docs';
const TARGET_DIR = path.resolve(__dirname, '../docs/en');

async function sync() {
    console.log(`Syncing docs from ${REPO} to ${TARGET_DIR}...`);

    // Remove existing en docs to ensure clean slate? 
    // Maybe not if we want to preserve some manual edits? 
    // For a mirror site, we usually want to overwrite.

    if (fs.existsSync(TARGET_DIR)) {
        console.log('Cleaning existing docs...');
        fs.rmSync(TARGET_DIR, { recursive: true, force: true });
    }

    const emitter = degit(REPO, {
        cache: false,
        force: true,
        verbose: true,
    });

    emitter.on('info', info => {
        console.log(info.message);
    });

    try {
        await emitter.clone(TARGET_DIR);
        console.log('Docs synced successfully!');
    } catch (err) {
        console.error('Error syncing docs:', err);
        process.exit(1);
    }
}

sync();
