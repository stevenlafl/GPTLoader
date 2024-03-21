import logger from './logger';

logger.info('Starting GPTLoader application...');

// Placeholder for future application logic
import { readFileContents } from './fileReader';

readFileContents().then(files => {
  console.log('Files read:', files);
}).catch(console.error);

logger.info('GPTLoader application started.');

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`);
});