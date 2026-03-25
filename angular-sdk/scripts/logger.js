const { CONFIG } = require('./config');

function error(message) {
    console.error(`\n❌ ${CONFIG.colors.red}${message}${CONFIG.styles.reset}\n`);
}

function warn(message) {
    console.warn(`⚠️  ${CONFIG.colors.yellow}${message}${CONFIG.styles.reset}`);
}

function info(message) {
    console.log(`${CONFIG.colors.blue}${message}${CONFIG.styles.reset}`);
}

function success(message) {
    console.log(`${CONFIG.colors.green}${message}${CONFIG.styles.reset}`);
}

function step(message) {
    console.log(`${CONFIG.colors.cyan}${message}${CONFIG.styles.reset}`);
}

function plain(message) {
    console.log(message);
}

module.exports = {
    error,
    warn,
    info,
    success,
    step,
    plain
};
