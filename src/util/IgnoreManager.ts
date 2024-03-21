import fs from 'fs';
import path from 'path';
import ignore, {Ignore} from 'ignore';
import { logger } from './LoggerFactory';

class IgnoreManager {
  private ignoreFiles: string[];
  private ig: Ignore;

  constructor({
      ignoreFiles = [],
      additionalPatterns = []
    }: {
      ignoreFiles?: string[],
      additionalPatterns?: string[]
    } = {}) {
    this.ignoreFiles = ignoreFiles;
    this.ig = ignore();
    this.initializeDefaults();
    this.loadIgnorePatterns();
    this.addAdditionalPatterns(additionalPatterns);
  }

  initializeDefaults() {
    // Explicitly exclude certain files or directories by default
    this.ig.add([
      'node_modules/',
      '.gptignore',
      '.env',
      '.git',
      '.gitignore',
      '.dockerignore',
      'package-lock.json',
    ]);
  }

  loadIgnorePatterns() {
    this.ignoreFiles.forEach(fileName => {
      try {
        const filePath = path.join(process.cwd(), fileName);
        if (fs.existsSync(filePath)) {
          const patterns = fs.readFileSync(filePath, 'utf8');
          this.ig.add(patterns);
          logger.debug(`Loaded ignore patterns from ${fileName}`);
        } else {
          logger.debug(`${fileName} not found. Skipping.`);
        }
      } catch (error) {
        logger.error(`Error reading ${fileName}: ${error}`);
      }
    });
  }
  
  addAdditionalPatterns(patterns: string[]) {
    patterns.forEach(pattern => {
      this.ig.add(pattern);
      logger.debug(`Added additional ignore pattern: ${pattern}`);
    });
  }

  shouldExclude(fileName: string) {
    const relativePath = path.relative(process.cwd(), fileName);
    const isExcluded = this.ig.ignores(relativePath);
    if (isExcluded) {
      logger.debug(`File ${relativePath} is excluded based on ignore patterns.`);
    } else {
      logger.debug(`File ${relativePath} is included.`);
    }
    return isExcluded;
  }
}

export { IgnoreManager };