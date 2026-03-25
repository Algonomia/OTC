const path = require('path');
const utils = require('../../utils');
const logger = require('../../logger');
const { CONFIG } = require('../../config');

class MissingTranslations {
    constructor() {}

    logMissingTranslations(translations, keyOrigins) {
        const invertedIndex = this._buildInvertedIndex(translations);
        const languages = Object.keys(translations);

        Object.keys(invertedIndex).forEach(key => {
            const presentLanguages = Object.keys(invertedIndex[key]);
            const missingLanguages = languages.filter(lang => !presentLanguages.includes(lang));

            missingLanguages.forEach(lang => {
                const expectedPath = this._findExpectedFilePath(keyOrigins, lang, key) || '(unknown)';

                logger.warn(
                    `Missing translation for key: '${key}' in language '${lang}'\n` +
                    `   -> Expected in:${CONFIG.styles.bold} ${expectedPath} ${CONFIG.styles.reset}`
                );
            });
        });
    }

    _buildInvertedIndex(obj, pathKey = '', index = {}) {
        const languages = Object.keys(obj);

        const allLeafs = languages.every(lang => !utils.isObject(obj[lang]));

        if (allLeafs) {
            index[pathKey] = {};
            languages.forEach(lang => {
                if (obj[lang] !== undefined) {
                    index[pathKey][lang] = obj[lang];
                }
            });
        } else {
            const allKeys = new Set();
            languages.forEach(lang => {
                if (utils.isObject(obj[lang])) {
                    Object.keys(obj[lang]).forEach(key => allKeys.add(key));
                }
            });

            allKeys.forEach(key => {
                const nestedObj = {};
                languages.forEach(lang => {
                    if (utils.isObject(obj[lang]) && obj[lang].hasOwnProperty(key)) {
                        nestedObj[lang] = obj[lang][key];
                    }
                });

                const currentPath = pathKey ? `${pathKey}.${key}` : key;
                this._buildInvertedIndex(nestedObj, currentPath, index);
            });
        }

        return index;
    }

    _findExpectedFilePath(keyOrigins, lang, fullPath) {
        if (!fullPath) {
            return null;
        }

        const parts = fullPath.split('.');

        for (let i = parts.length; i >= 1; i--) {
            const key = parts.slice(0, i).join('.');
            if (keyOrigins[key]) {
                return path.join(keyOrigins[key], `${lang}.json`);
            }
        }

        return null;
    }
}

module.exports = MissingTranslations;
