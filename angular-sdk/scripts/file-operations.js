const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const utils = require('./utils');

function loadJson(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        throw new Error(`JSON error in ${filePath}: ${err.message}`);
    }
}

function writeJson(filePath, data) {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
}

function createDirectoryIfNotExist(dirPath) {
    if (!utils.pathExists(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.info(`📁 Created directory: ${dirPath}`);
    }
}

function deleteFilesInDirectory(dirPath) {
    if (!utils.pathExists(dirPath)) {
        return;
    }

    fs.readdirSync(dirPath)
        .map(name => path.join(dirPath, name))
        .filter(utils.isFile)
        .forEach(filePath => {
            fs.unlinkSync(filePath);
            logger.info(`🗑️  Deleted: ${filePath}`);
        });
}

function findDirectoriesHavingTargetName(dir, targetName, excludeDirs = []) {
    const results = [];

    if (!utils.pathExists(dir)) {
        return results;
    }

    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
        if (excludeDirs.includes(entry)) {
            continue;
        }

        const fullPath = path.join(dir, entry);

        if (!utils.isDirectory(fullPath)) {
            continue;
        }

        if (entry === targetName) {
            results.push(fullPath);
        }

        results.push(...findDirectoriesHavingTargetName(fullPath, targetName, excludeDirs));
    }

    return results;
}

function getUniqueBaseNamesByExtension(folders, extension) {
    const names = new Set();

    folders.forEach(folder => {
        if (!utils.pathExists(folder)) {
            return;
        }

        fs.readdirSync(folder)
            .filter(f => f.endsWith(extension))
            .forEach(f => names.add(this.getFileNameNoExtension(f)));
    });

    return Array.from(names);
}

function getFileNameNoExtension(fileName) {
    return fileName.split('.').slice(0, -1).join('.');
}

module.exports = {
    loadJson,
    writeJson,
    createDirectoryIfNotExist,
    deleteFilesInDirectory,
    findDirectoriesHavingTargetName,
    getUniqueBaseNamesByExtension,
    getFileNameNoExtension
};
