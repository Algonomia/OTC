const fs = require('fs');

function isObject(val) {
    return val && typeof val === 'object' && !Array.isArray(val);
}

function pathExists(targetPath) {
    try {
        return fs.existsSync(targetPath);
    } catch {
        return false;
    }
}

function isDirectory(targetPath) {
    try {
        return fs.statSync(targetPath).isDirectory();
    } catch {
        return false;
    }
}

function isFile(targetPath) {
    try {
        return fs.statSync(targetPath).isFile();
    } catch {
        return false;
    }
}

module.exports = {
    isObject,
    pathExists,
    isDirectory,
    isFile
};
