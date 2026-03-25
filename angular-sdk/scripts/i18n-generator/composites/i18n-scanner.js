const fs = require('fs');
const path = require('path');
const { CONFIG } = require('../../config');
const { I18N_CONFIG } = require('./i18n-config');
const logger = require('../../logger');
const fileOps = require('../../file-operations');
const utils = require('../../utils');

const EXCLUDED_DIRS = ['node_modules', 'dist', '.angular'];

function find_i18n_folders_in_local_project() {
    logger.info('🔎 Searching for i18n in components...');

    return fileOps.findDirectoriesHavingTargetName(
        CONFIG.srcRoot,
        CONFIG.i18nFolderName,
        EXCLUDED_DIRS
    );
}

function find_i18n_folders_in_node_modules() {
    logger.info('🔎 Searching for i18n in node_modules...');

    return I18N_CONFIG.nodeModulesWhitelist.flatMap(pkg => {
        const pkgPath = path.join(CONFIG.nodeModulesPath, pkg);

        if (!utils.pathExists(pkgPath)) {
            logger.warn(`The "${pkg}" package does not exist in node_modules.`);
            return [];
        }

        return fileOps.findDirectoriesHavingTargetName(
            pkgPath,
            CONFIG.i18nFolderName,
            EXCLUDED_DIRS
        );
    });
}

module.exports = {
    find_i18n_folders_in_local_project,
    find_i18n_folders_in_node_modules
};
