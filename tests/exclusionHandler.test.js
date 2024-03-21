"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const exclusionHandler_1 = require("../src/exclusionHandler");
const path = __importStar(require("path"));
describe('ExclusionHandler', () => {
    beforeAll(() => {
        // Mock the filesystem to simulate .gitignore, .dockerignore, and .gptignore files
        jest.mock('fs', () => ({
            existsSync: jest.fn().mockImplementation((filePath) => {
                return ['.gitignore', '.dockerignore', '.gptignore'].includes(path.basename(filePath));
            }),
            readFileSync: jest.fn().mockImplementation((filePath) => {
                switch (path.basename(filePath)) {
                    case '.gitignore':
                        return 'node_modules\nbuild';
                    case '.dockerignore':
                        return 'docker-compose.yml';
                    case '.gptignore':
                        return 'test.txt';
                    default:
                        return '';
                }
            })
        }));
    });
    test('should exclude files listed in .gitignore, .dockerignore, and .gptignore', () => {
        expect((0, exclusionHandler_1.shouldExclude)('node_modules/package.json')).toBeTruthy();
        expect((0, exclusionHandler_1.shouldExclude)('build/main.js')).toBeTruthy();
        expect((0, exclusionHandler_1.shouldExclude)('docker-compose.yml')).toBeTruthy();
        expect((0, exclusionHandler_1.shouldExclude)('test.txt')).toBeTruthy();
    });
    test('should not exclude files not listed in ignore files', () => {
        expect((0, exclusionHandler_1.shouldExclude)('src/index.ts')).toBeFalsy();
        expect((0, exclusionHandler_1.shouldExclude)('README.md')).toBeFalsy();
    });
    afterAll(() => {
        jest.restoreAllMocks();
    });
});
