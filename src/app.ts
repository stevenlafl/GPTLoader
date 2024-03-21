import { readFileContents } from './fileReader';
import { generateMarkdown } from './templateProcessor';
import { logger } from './logger';
import fs from 'fs';

async function main() {
  try {
    logger.info('Starting GPTLoader application...');

    // Step 1: Invoke the FileReader
    const files = await readFileContents();
    logger.info(`Files read: ${files.map(f => f.path)}`);

    // Step 2: Pass the list of files to the TemplateProcessor
    const markdown = generateMarkdown(files);
    logger.info(`Markdown document generated.`);

    // Step 3: Save the markdown document to the file system
    const outputPath = './GPTLoaderOutput.md';
    fs.writeFileSync(outputPath, markdown);
    logger.info(`Markdown document saved to ${outputPath}`);

    logger.info('GPTLoader application completed successfully.');
  } catch (error) {
    logger.error(`An error occurred: ${error}}`);
  }
}

main().catch(error => logger.error(`Unhandled error: ${error.message}\n${error.stack}`));

// Error handling for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`);
});