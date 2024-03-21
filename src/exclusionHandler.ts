import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { logger } from './logger';

const ignoreFiles = ['.gitignore', '.dockerignore', '.gptignore'];

const readIgnorePatterns = () => {
  const ig = ignore();
  ig.add('node_modules/'); // Explicitly exclude node_modules
  ig.add('.gptignore'); // Always ignore .gptignore
  ig.add('.git'); // Always ignore .git
  ig.add('.gitignore');
  ig.add('.dockerignore');
  ig.add('package-lock.json')
  ignoreFiles.forEach(fileName => {
    try {
      const filePath = path.join(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        const patterns = fs.readFileSync(filePath, 'utf8');
        ig.add(patterns);
        logger.info(`Loaded ignore patterns from ${fileName}`);
      } else {
        logger.info(`${fileName} not found. Skipping.`);
      }
    } catch (error: any) {
      logger.error(`Error reading ${fileName}: ${error.message}\n${error.stack}`);
    }
  });
  return ig;
};

const ig = readIgnorePatterns();

const shouldExclude = (fileName: string) => {
  const relativePath = path.relative(process.cwd(), fileName);
  const isExcluded = ig.ignores(relativePath);
  if (isExcluded) {
    logger.info(`File ${relativePath} is excluded based on ignore patterns.`);
  } else {
    logger.info(`File ${relativePath} is included.`);
  }
  return isExcluded;
};

export { shouldExclude };