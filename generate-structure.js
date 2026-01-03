#!/usr/bin/env node
/**
 * Generátor structure.json pre lokálne použitie index.html
 * Spustite: node generate-structure.js
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = 'htmlUtilities';

function scanDirectory(dirPath) {
    const items = [];

    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = fullPath;

            if (entry.isDirectory()) {
                const children = scanDirectory(fullPath);
                // Pridaj priečinok len ak obsahuje HTML súbory
                if (children.length > 0) {
                    items.push({
                        name: entry.name,
                        type: 'folder',
                        path: relativePath,
                        children: children
                    });
                }
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
                items.push({
                    name: entry.name.replace('.html', ''),
                    type: 'file',
                    path: relativePath
                });
            }
        }

        // Zoradiť - priečinky prvé, potom súbory
        items.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name, 'sk');
        });

    } catch (error) {
        console.error(`Chyba pri čítaní ${dirPath}:`, error.message);
    }

    return items;
}

function countFiles(items) {
    let count = 0;
    for (const item of items) {
        if (item.type === 'file') {
            count++;
        } else if (item.children) {
            count += countFiles(item.children);
        }
    }
    return count;
}

// Hlavná logika
console.log('Generujem structure.json...');

const structure = scanDirectory(BASE_DIR);
const fileCount = countFiles(structure);

fs.writeFileSync('structure.json', JSON.stringify(structure, null, 2));

console.log(`✓ Vygenerované: ${fileCount} HTML súborov`);
console.log('✓ Uložené do: structure.json');
