#!/usr/bin/env node
const logger = require('../logger');
const I18nGenerator = require('./composites/i18n-generator');

if (require.main === module) {
    try {
        I18nGenerator.generate();
    } catch (error) {
        logger.error(`Unexpected error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

module.exports = I18nGenerator;
