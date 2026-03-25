const path = require('path');
const fs = require('fs');

const SDK_ROOT = path.join(__dirname, '..');       // toujours le SDK
const PROJECT_ROOT = process.cwd();                // l'app qui appelle le script

const rootNodeModules = path.join(PROJECT_ROOT, '..', 'node_modules');
const localNodeModules = path.join(PROJECT_ROOT, 'node_modules');
const nodeModulesPath = fs.existsSync(path.join(rootNodeModules, '@algonomia'))
    ? rootNodeModules
    : localNodeModules;

const CONFIG = {
    srcRoot: path.join(PROJECT_ROOT, 'src'),
    nodeModulesPath,
    jsonExt: '.json',
    i18nFolderName: '_i18n',
    styles: {
        reset: '\x1b[0m',
        bold: '\x1b[1m'
    },
    colors: {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m'
    }
};

module.exports = { SDK_ROOT, PROJECT_ROOT, CONFIG };
