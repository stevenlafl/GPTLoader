import fs from 'fs/promises';
import path from 'path';
import { shouldExclude } from './exclusionHandler';
import { logger } from './logger';

/*
const isBinaryFile = async (filePath: string): Promise<boolean> => {
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
    throw new Error(`Error checking if file is binary: ${error}`);
  }
};
*/

const readDirectoryRecursively = async (dir: string, allFiles: { path: string; content: string }[] = []) => {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (shouldExclude(fullPath)) {
          logger.info(`Excluded directory: ${fullPath}`);
        }
        else {
          await readDirectoryRecursively(fullPath, allFiles);
        }
      } else {
        if (!shouldExclude(fullPath) /*&& !(await isBinaryFile(fullPath))*/) {
          const content = await fs.readFile(fullPath, 'utf8');
          allFiles.push({ path: path.relative(process.cwd(), fullPath), content });
          logger.info(`Included file: ${fullPath}`);
        } else {
          logger.info(`Excluded file: ${fullPath}`);
        }
      }
    }));
  } catch (error) {
    logger.error(`Error reading directory: ${dir}\nError: ${error}`);
    throw error; // Rethrow to handle upstream
  }
  return allFiles;
};

const readFileContents = (): Promise<{ path: string; content: string }[]> => {
  logger.info('Scanning directory for files...');
  return readDirectoryRecursively(process.cwd())
    .then(files => {
      logger.info(`Scanning complete. Number of files included: ${files.length}`);
      return files;
    })
    .catch(error => {
      logger.error(`Error scanning directory: ${error.message}\n${error.stack}`);
      throw error; // Ensure this error is handled upstream if necessary
    });
};

export { readFileContents };