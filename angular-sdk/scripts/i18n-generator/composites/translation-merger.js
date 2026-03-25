const path = require('path');
const fileOps = require('../../file-operations');
const utils = require('../../utils');
const { CONFIG } = require('../../config');

class TranslationMerger {
    constructor() {}

    mergeAll(i18nFolders, langs) {
        const langJson = this._createLangJson(langs);
        const keyOrigin = {};
        i18nFolders.forEach(folder => {
            langs.forEach(lang => this._mergeFromFolder(langJson, keyOrigin, folder, lang));
        });
        return [langJson, keyOrigin];
    }

    _createLangJson(langs) {
        const translations = {};
        langs.forEach(lang => {
            translations[lang] = {};
        });
        return translations;
    }

    _mergeFromFolder(langJson, keyOrigin, folder, lang) {
        const filePath = path.join(folder, `${lang}.json`);

        if (!utils.pathExists(filePath)) {
            return;
        }

        const data = fileOps.loadJson(filePath);

        this._deepMerge(langJson[lang], keyOrigin, data, filePath, '', lang);
    }

    _deepMerge(target, keyOrigin, source, sourceFile, pathKey = '', lang) {
        for (const key of Object.keys(source)) {
            const currentPath = pathKey ? `${pathKey}.${key}` : key;
            const targetIsObj = target.hasOwnProperty(key) && utils.isObject(target[key]);
            const sourceIsObj = utils.isObject(source[key]);

            if (target.hasOwnProperty(key) && !(targetIsObj && sourceIsObj)) {
                throw new Error(
                    `Translation conflict for key '${currentPath}'\n` +
                    `   ➡ Duplicated in:${CONFIG.styles.bold} ${sourceFile} ${CONFIG.styles.reset}`
                );
            }

            if (targetIsObj && sourceIsObj) {
                this._deepMerge(target[key], keyOrigin, source[key], sourceFile, currentPath, lang);
            } else {
                target[key] = source[key];
                keyOrigin[currentPath] = path.dirname(sourceFile);
            }
        }
    }
}

module.exports = TranslationMerger;
