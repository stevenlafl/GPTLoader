// src/fileReader.ts
import fs from 'fs/promises';
import path from 'path';
import { IgnoreManager } from './IgnoreManager';
import { logger } from './LoggerFactory';

class FileReader {

  ignoreManager: IgnoreManager;
  
  constructor(argv: any) {
    this.ignoreManager = new IgnoreManager({
      ignoreFiles: argv['ignore-files'],
      additionalPatterns: argv.ignore
    });
  }

  private async readDirectoryRecursively(dir: string, allFiles: { path: string; content: string }[] = []): Promise<{ path: string; content: string }[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (this.ignoreManager.shouldExclude(fullPath)) {
            logger.debug(`Excluded directory: ${fullPath}`);
          }
          else {
            await this.readDirectoryRecursively(fullPath, allFiles);
          }
        } else {
          if (!this.ignoreManager.shouldExclude(fullPath)) {
            const content = await fs.readFile(fullPath, 'utf8');
            allFiles.push({ path: path.relative(process.cwd(), fullPath), content });
            logger.debug(`Included file: ${fullPath}`);
          } else {
            logger.debug(`Excluded file: ${fullPath}`);
          }
        }
      }));
    } catch (error) {
      logger.error(`Error reading directory: ${dir}\nError: ${error}`);
      throw error; // Rethrow to handle upstream
    }
    return allFiles;
  }

  public async readFileContents(): Promise<{ path: string; content: string }[]> {
    logger.debug('Scanning directory for files...');
    return this.readDirectoryRecursively(process.cwd())
      .then(files => {
        logger.debug(`Scanning complete. Number of files included: ${files.length}`);
        return files;
      })
      .catch(error => {
        logger.error(`Error scanning directory: ${error.message}\n${error.stack}`);
        throw error; // Ensure this error is handled upstream if necessary
      });
  }

  /*
  // This function can be utilized in the future to exclude binary files
  private async isBinaryFile(filePath: string): Promise<boolean> {
    try {
      const buffer = Buffer.alloc(512); // Allocate a buffer to read into
      const fileHandle = await fs.open(filePath, 'r');
      try {
        await fileHandle.read(buffer, 0, 512, 0); // Read up to 512 bytes from the beginning of the file
      } finally {
        await fileHandle.close();
      }
      // Check if there's a null byte in the buffer
      return buffer.includes(0);
    } catch (error) {
      logger.error(`Error checking if file is binary: ${error.message}\n${error.stack}`);
      throw error;
    }
  }
  */
}

export { FileReader };