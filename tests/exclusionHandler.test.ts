import { shouldExclude } from '../src/exclusionHandler';
import * as fs from 'fs';
import * as path from 'path';

describe('ExclusionHandler', () => {
    beforeAll(() => {
        // Mock the filesystem to simulate .gitignore, .dockerignore, and .gptignore files
        jest.mock('fs', () => ({
            existsSync: jest.fn().mockImplementation((filePath: string) => {
                return ['.gitignore', '.dockerignore', '.gptignore'].includes(path.basename(filePath));
            }),
            readFileSync: jest.fn().mockImplementation((filePath: string) => {
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
        expect(shouldExclude('node_modules/package.json')).toBeTruthy();
        expect(shouldExclude('build/main.js')).toBeTruthy();
        expect(shouldExclude('docker-compose.yml')).toBeTruthy();
        expect(shouldExclude('test.txt')).toBeTruthy();
    });

    test('should not exclude files not listed in ignore files', () => {
        expect(shouldExclude('src/index.ts')).toBeFalsy();
        expect(shouldExclude('README.md')).toBeFalsy();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
});