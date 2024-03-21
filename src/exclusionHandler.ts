import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { logger } from './logger';

const ignoreFiles = ['.gitignore', '.dockerignore', '.gptignore'];

const readIgnorePatterns = () => {
  const ig = ignore();
  ignoreFiles.forEach(fileName => {
    try {
      const filePath = path.join(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        const patterns = fs.readFileSync(filePath, 'utf8');
        ig.add(patterns);
        logger.info(`Loaded ignore patterns from ${fileName}`);
      } else {
        logger.warn(`${fileName} not found. Skipping.`);
      }
    } catch (error: any) {
      logger.error(`Error reading ${fileName}: ${error.message}\n${error.stack}`);
    }
  });
  return ig;
};

const ig = readIgnorePatterns();

const shouldExclude = (fileName: string) => {
  const isExcluded = ig.ignores(fileName);
  if (isExcluded) {
    logger.info(`File ${fileName} is excluded based on ignore patterns.`);
  } else {
    logger.info(`File ${fileName} is included.`);
  }
  return isExcluded;
};

export { shouldExclude };