import { IgnoreManager } from '../src/util/IgnoreManager';
import * as path from 'path';

describe('IgnoreManager', () => {
    let ignoreManager: IgnoreManager;
    
    beforeAll(async () => {
        // Mock the filesystem to simulate .gitignore, .dockerignore, and .gptignore files
        jest.mock('fs', () => ({
            existsSync: jest.fn().mockImplementation((filePath: string) => {
                return ['.gitignore', '.dockerignore', '.gptignore'].includes(path.basename(filePath));
            }),
            mkdirSync: jest.fn().mockImplementation((filePath: string) => {
                return true;
            }),
            stat: jest.fn().mockImplementation((filePath: string) => {
                return { isDirectory: () => false };
            }),
            readdirSync: jest.fn().mockImplementation((dirPath: string) => {
                return [];
            }),
            readFileSync: jest.fn().mockImplementation((filePath: string) => {
                switch (path.basename(filePath)) {
                    case '.gitignore':
                        return 'node_modules\n*.log\ndist\n.env';
                    case '.dockerignore':
                        return 'Dockerfile\n.env\n.gitignore\nnode_modules\ndist\n*.log';
                    case '.gptignore':
                        return '*.md\ntest.txt';
                    default:
                        return '';
                }
            })
        }));
        
        // Mock the logger to avoid actual logging during tests
        jest.mock('../src/util/LoggerFactory', () => ({
            logger: {
            info: jest.fn(),
            error: jest.fn(),
            },
        }));

        const { IgnoreManager } = await import('../src/util/IgnoreManager');
        ignoreManager = new IgnoreManager();
    });

    test('should exclude files listed in .gitignore, .dockerignore, and .gptignore', () => {
        expect(ignoreManager.shouldExclude('error.log')).toBeTruthy();
        expect(ignoreManager.shouldExclude('combined.log')).toBeTruthy();
        expect(ignoreManager.shouldExclude('dist')).toBeTruthy();
        expect(ignoreManager.shouldExclude('node_modules/.package-lock.json')).toBeTruthy();
        expect(ignoreManager.shouldExclude('test.txt')).toBeTruthy();
        expect(ignoreManager.shouldExclude('README.md')).toBeTruthy();
    });

    test('should not exclude files not listed in ignore files', () => {
        expect(ignoreManager.shouldExclude('build/main.js')).toBeFalsy();
        expect(ignoreManager.shouldExclude('docker-compose.yml')).toBeFalsy();
        expect(ignoreManager.shouldExclude('src/index.ts')).toBeFalsy();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
});