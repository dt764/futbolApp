const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info;

const ts = () => new Date().toISOString();

const logger = {
  error: (...args) => { if (currentLevel >= levels.error) console.error(`[${ts()}] [ERROR]`, ...args); },
  warn: (...args) => { if (currentLevel >= levels.warn) console.warn(`[${ts()}] [WARN]`, ...args); },
  info: (...args) => { if (currentLevel >= levels.info) console.log(`[${ts()}] [INFO]`, ...args); },
  debug: (...args) => { if (currentLevel >= levels.debug) console.log(`[${ts()}] [DEBUG]`, ...args); },
};

module.exports = logger;
