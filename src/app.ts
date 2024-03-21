const logger = require('./logger');

logger.info('Starting GPTLoader application...');

// Placeholder for future application logic

logger.info('GPTLoader application started.');

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`);
});