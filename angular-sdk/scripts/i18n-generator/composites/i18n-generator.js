const path = require('path');
const { I18N_CONFIG } = require('./i18n-config');
const logger = require('../../logger');
const fileOps = require('../../file-operations');
const scanner = require('./i18n-scanner');
const TranslationMerger = require('./translation-merger');
const TranslationValidator = require('./missing-translations');

class I18nGenerator {
    static generate() {
        logger.plain('');

        const i18nFolders = [
            ...scanner.find_i18n_folders_in_local_project(),
            ...scanner.find_i18n_folders_in_node_modules()
        ];
        const langs = fileOps.getUniqueBaseNamesByExtension(i18nFolders, '.json');

        if (langs.length === 0) {
            logger.warn('No language files found in sources.');
            logger.plain('→ No final files generated.\n');
            return;
        }

        const merger = new TranslationMerger();
        const [translations, keyOrigins] = merger.mergeAll(i18nFolders, langs);

        const validator = new TranslationValidator(
            translations, keyOrigins
        );
        validator.logMissingTranslations(translations, keyOrigins);

        fileOps.createDirectoryIfNotExist(I18N_CONFIG.finalI18nFile);
        fileOps.deleteFilesInDirectory(I18N_CONFIG.finalI18nFile);
        langs.forEach(lang => {
            const filePath = path.join(I18N_CONFIG.finalI18nFile, `${lang}.json`);

            fileOps.writeJson(filePath, translations[lang]);
            logger.step(`✔ Generated: ${filePath}`);
        });

        logger.plain('');
        logger.success('✅ i18n generation completed successfully.');
        logger.plain('');
    }
}

module.exports = I18nGenerator;
