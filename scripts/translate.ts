
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EN_DIR = path.resolve(__dirname, '../docs/en');
const ZH_DIR = path.resolve(__dirname, '../docs/zh');

function copyFiles() {
    console.log('Copying EN docs to ZH as placeholders...');

    if (!fs.existsSync(EN_DIR)) {
        console.error('English docs not found. Run pnpm sync first.');
        process.exit(1);
    }

    // Use fs.cpSync for recursive copy
    fs.cpSync(EN_DIR, ZH_DIR, {
        recursive: true,
        filter: (src, dest) => {
            // Avoid copying assets if we want to share them, but for simplicity copy all
            return true;
        }
    });

    console.log('Files copied. Now prepending translation notice...');

    // Need to walk and modify .md files
    // Since I don't have glob, I'll use a simple recursive function

    function walk(dir: string) {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                walk(filePath);
            } else {
                if (path.extname(file) === '.md') {
                    processFile(filePath);
                }
            }
        });
    }

    function processFile(filePath: string) {
        let content = fs.readFileSync(filePath, 'utf-8');
        const notice = `::: warning 自动翻译\n本页面尚未翻译，当前显示为英文原文。\n:::\n\n`;
        if (!content.startsWith('::: warning')) {
            fs.writeFileSync(filePath, notice + content);
        }
    }

    walk(ZH_DIR);
    console.log('Translation placeholders setup complete.');
}

copyFiles();
