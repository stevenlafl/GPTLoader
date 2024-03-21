"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldExclude = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ignore_1 = __importDefault(require("ignore"));
const logger_1 = require("./logger");
const ignoreFiles = ['.gitignore', '.dockerignore', '.gptignore'];
const readIgnorePatterns = () => {
    const ig = (0, ignore_1.default)();
    ignoreFiles.forEach(fileName => {
        try {
            const filePath = path_1.default.join(process.cwd(), fileName);
            if (fs_1.default.existsSync(filePath)) {
                const patterns = fs_1.default.readFileSync(filePath, 'utf8');
                ig.add(patterns);
                logger_1.logger.info(`Loaded ignore patterns from ${fileName}`);
            }
            else {
                logger_1.logger.warn(`${fileName} not found. Skipping.`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error reading ${fileName}: ${error.message}\n${error.stack}`);
        }
    });
    return ig;
};
const ig = readIgnorePatterns();
const shouldExclude = (fileName) => {
    const isExcluded = ig.ignores(fileName);
    if (isExcluded) {
        logger_1.logger.info(`File ${fileName} is excluded based on ignore patterns.`);
    }
    else {
        logger_1.logger.info(`File ${fileName} is included.`);
    }
    return isExcluded;
};
exports.shouldExclude = shouldExclude;
