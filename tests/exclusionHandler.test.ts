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
        expect(shouldExclude('error.log')).toBeTruthy();
        expect(shouldExclude('combined.log')).toBeTruthy();
        expect(shouldExclude('dist')).toBeTruthy();
        expect(shouldExclude('node_modules/.package-lock.json')).toBeTruthy();
        expect(shouldExclude('test.txt')).toBeTruthy();
    });

    test('should not exclude files not listed in ignore files', () => {
        expect(shouldExclude('build/main.js')).toBeFalsy();
        expect(shouldExclude('docker-compose.yml')).toBeFalsy();
        expect(shouldExclude('src/index.ts')).toBeFalsy();
        expect(shouldExclude('README.md')).toBeFalsy();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
});