
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs');

const TAGS_TO_ESCAPE = [
    'trade_id', 'tradeid', 'pair', 'rate', 'n', 'lock_id', 'topic_id',
    'close_date', 'close_rate', 'exit_reason', 'trade_ID_to_update',
    'database-file', 'filepath', 'table_name'
];

function getRelativeAssetPath(filePath: string): string {
    const relPath = path.relative(DOCS_DIR, filePath);
    const parts = relPath.split(path.sep);

    if (parts.length >= 2) {
        const lang = parts[0];
        const langDir = path.join(DOCS_DIR, lang);
        const fileDir = path.dirname(filePath);

        let relativeToLang = path.relative(fileDir, langDir);
        if (relativeToLang === '') relativeToLang = '.';

        let result = path.join(relativeToLang, 'assets');
        result = result.split(path.sep).join('/');

        if (!result.startsWith('.') && !result.startsWith('/')) {
            result = './' + result;
        }
        return result;
    }
    return './assets';
}

function mapAdmonitionType(type: string): string {
    const map: Record<string, string> = {
        'note': 'info', 'tip': 'tip', 'warning': 'warning', 'danger': 'danger',
        'example': 'tip', 'abstract': 'info', 'info': 'info', 'important': 'info',
        'error': 'danger', 'failure': 'danger', 'success': 'tip', 'question': 'info'
    };
    return map[type.toLowerCase()] || 'info';
}

function processContent(content: string, filePath: string): string {
    let res = content;

    // 0. Resolve Snippets (Inline them) - MkDocs style
    const snippetRegex = /^(\s*)--8<--\s+["'](.*?)["']/gm;
    let limit = 20;
    while (snippetRegex.test(res) && limit > 0) {
        res = res.replace(snippetRegex, (match, indent, includePath) => {
            const fullIncludePath = path.resolve(path.dirname(filePath), includePath);
            if (fs.existsSync(fullIncludePath)) {
                let includeContent = fs.readFileSync(fullIncludePath, 'utf-8');
                if (indent) {
                    includeContent = includeContent.split('\n').map(l => indent + l).join('\n');
                }
                return includeContent;
            }
            return `<!-- Snippet not found: ${includePath} -->`;
        });
        snippetRegex.lastIndex = 0;
        limit--;
    }

    const lines = res.split(/\r?\n/);
    const processedLines: string[] = [];

    let inAdmonition = false;
    let admonitionIndent = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const headerMatch = line.match(/^(\s*)(!!!|\?\?\?|:::)\s+(\w+)(?:\s+["']?(.*?)["']?)?$/);

        if (headerMatch) {
            const indent = headerMatch[1];
            const marker = headerMatch[2];
            const type = headerMatch[3];
            const title = headerMatch[4] || '';

            if (marker !== ':::' || (marker === ':::' && !inAdmonition)) {
                if (inAdmonition) {
                    processedLines.push(`${' '.repeat(admonitionIndent)}:::`);
                }
                const viteType = mapAdmonitionType(type);
                processedLines.push(`${indent}::: ${viteType}${title ? ' ' + title : ''}`);
                inAdmonition = true;
                admonitionIndent = indent.length;
                continue;
            }
        }

        if (inAdmonition) {
            const currentIndentMatch = line.match(/^(\s*)(.*)/);
            const currentIndent = currentIndentMatch ? currentIndentMatch[1].length : 0;
            const isEmpty = line.trim() === '';

            if (!isEmpty && currentIndent <= admonitionIndent) {
                processedLines.push(`${' '.repeat(admonitionIndent)}:::`);
                inAdmonition = false;
            } else {
                const deIndented = line.replace(new RegExp(`^\\s{0,${admonitionIndent + 4}}`), '');
                processedLines.push(deIndented);
                continue;
            }
        }

        processedLines.push(line);
    }

    if (inAdmonition) {
        processedLines.push(`${' '.repeat(admonitionIndent)}:::`);
    }

    res = processedLines.join('\n');

    // 1. Convert MkDocs Buttons & Icons to Shields.io Badges
    res = res.replace(
        /\[:octicons-star-16: Star\]\((.*?)\)\{.*?\.md-button.*?\}/g,
        '[<img src="https://img.shields.io/github/stars/freqtrade/freqtrade?style=social">]($1)'
    );
    res = res.replace(
        /\[:octicons-repo-forked-16: Fork\]\((.*?)\)\{.*?\.md-button.*?\}/g,
        '[<img src="https://img.shields.io/github/forks/freqtrade/freqtrade?style=social">]($1)'
    );
    res = res.replace(
        /\[:octicons-download-16: Download\]\((.*?)\)\{.*?\.md-button.*?\}/g,
        '[<img src="https://img.shields.io/badge/Download-Stable-white?logo=github">]($1)'
    );
    res = res.replace(/\[(.*?)\]\((.*?)\)\{.*?\.md-button.*?\}/g, '[$1]($2)');

    // 2. Wrap consecutive badge lines in a flex container
    res = res.replace(/((?:(?:^|\n)\[(?:!|(?<!!)<img)).*)+/g, (match) => {
        const lines = match.trim().split('\n').map(l => l.trim()).filter(l => l !== '');
        if (lines.length > 1) {
            return `\n\n<div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 1.5rem 0;">\n\n${lines.join('\n\n')}\n\n</div>\n\n`;
        }
        return match;
    });

    // 3. Fix Image Paths
    const relAssetPath = getRelativeAssetPath(filePath);
    res = res.replace(/src="(?:\.\.?\/)+assets\//g, 'src="assets/'); // Normalize
    res = res.replace(/src="assets\//g, `src="${relAssetPath}/`); // Apply
    res = res.replace(/!\[(.*?)\]\((?:\.\.?\/)+assets\//g, '![$1](assets/'); // Normalize
    res = res.replace(/!\[(.*?)\]\(assets\//g, `![$1](${relAssetPath}/`); // Apply

    // 4. Escape Vue custom tags
    TAGS_TO_ESCAPE.forEach(tag => {
        const regex = new RegExp(`<(${tag})(\\s|>|\\/>)`, 'gi');
        res = res.replace(regex, (match, p1, p2) => `&lt;${p1}${p2}`);
    });

    // 5. Convert Checkboxes [X] -> ✅, [ ] -> ⬜
    res = res.replace(/^(\s*)-\s+\[X\]\s+/gim, '$1- ✅ ');
    res = res.replace(/^(\s*)-\s+\[x\]\s+/gim, '$1- ✅ ');
    res = res.replace(/^(\s*)-\s+\[\s\]\s+/gim, '$1- ⬜ ');

    return res;
}

function processDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDir(filePath);
        } else if (file.endsWith('.md')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const newContent = processContent(content, filePath);
            if (content !== newContent) {
                console.log(`Normalizing ${file}`);
                fs.writeFileSync(filePath, newContent);
            }
        }
    });
}

processDir(DOCS_DIR);
