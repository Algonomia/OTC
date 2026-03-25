const sprite = require('svg-sprite');
const fs = require('fs');
const path = require('path');
const { SDK_ROOT } = require('../config');
const logger = require("../logger");

// Base directory for icon sets
const ICONS_BASE = path.join(SDK_ROOT, 'icons');
const STYLE_FOLDERS = ['Light', 'Medium', 'Normal', 'Regular'];

// Convert to PascalCase (Arrow Down → ArrowDown)
function toPascalCase(str) {
    return str
        .replace(/\.svg$/, '')                 // remove .svg
        .replace(/[^a-zA-Z0-9]+/g, ' ')        // replace non-alphanumeric characters with space
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

// Sprite configuration
const config = {
    mode: {
        symbol: {
            dest: '.',                  // output directly in the root directory
            sprite: 'sprite.svg'        // output file name
        }
    },
    shape: {
        id: {
            generator: (filePath) => {
                // Ensure correct relative path handling
                const parts = filePath.split(path.sep);  // Split by the system separator
                // Ensure the style folder is the first part and process further
                const style = parts.shift();  // Extract style folder (Light, Medium, etc.)
                const nestedPath = parts.slice(0, -1).map(p => toPascalCase(p)).join('/'); // Process folder names
                const fileName = toPascalCase(parts.pop()); // File name (last part)

                // Return the final ID in the format: Light:Nested/Path/To/FileName
                return `${style}:${nestedPath ? nestedPath + '/' : ''}${fileName}`;
            }
        }
    }
};

const spriter = new sprite(config);

function collectSVGs(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            collectSVGs(fullPath);
        } else if (file.endsWith('.svg')) {
            spriter.add(
                fullPath,
                path.relative(ICONS_BASE, fullPath),
                removeFillAttribute(fs.readFileSync(fullPath, { encoding: 'utf-8' }))
            );
        }
    });
}

function removeFillAttribute(svgContent) {
    return svgContent.replace(/fill="[^"]*"/g, '');
}

// Collect SVGs from all style folders
STYLE_FOLDERS.forEach(folder => {
    const fullPath = path.join(ICONS_BASE, folder);
    if (fs.existsSync(fullPath)) {
        collectSVGs(fullPath);
    }
});

spriter.compile((err, result) => {
    if (err) throw err;

    const assetsDir = path.join(SDK_ROOT, 'src/assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    for (const mode in result) {
        for (const resource in result[mode]) {
            fs.writeFileSync(
                path.join(assetsDir, result[mode][resource].relative),
                result[mode][resource].contents
            );
        }
    }

    logger.success('✅ SVG sprite generated with PascalCase IDs.');
});
