const path = require('path');
const { PROJECT_ROOT } = require('../../config');
const sdk_white_list = ['@algonomia/angular-sdk'];

function loadAppWhitelist() {
    const configPath = path.join(PROJECT_ROOT, 'i18n.config.js');

    try {
        const appConfig = require(configPath);

        if (Array.isArray(appConfig.nodeModulesWhitelist)) {
            return appConfig.nodeModulesWhitelist;
        }
    } catch (_) {}

    return [];
}

const I18N_CONFIG = {
    finalI18nFile: path.join(PROJECT_ROOT, 'src/assets/i18n'),
    nodeModulesWhitelist: [...sdk_white_list, ...loadAppWhitelist()]
};

module.exports = { I18N_CONFIG };
