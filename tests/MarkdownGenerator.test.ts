import { MarkdownGenerator } from '../src/util/MarkdownGenerator';
import { logger } from '../src/util/LoggerFactory';
import Handlebars from 'handlebars';

// Mock the logger to avoid actual logging during tests
jest.mock('../src/util/LoggerFactory', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MarkdownGenerator', () => {

  beforeEach(() => {
    // Reset and re-instantiate MarkdownGenerator before each test
    jest.clearAllMocks();
  });

  test('should correctly escape backticks in content', () => {
    const fileData = [
      { path: 'example.txt', content: 'This is `code`' },
    ];
    const expectedOutput = `
# GPTLoader Output

## File: example.txt
\`\`\`
This is \\\`code\\\`
\`\`\`

    `.trim();

    const markdownGenerator = new MarkdownGenerator();
    const markdownOutput = markdownGenerator.generateMarkdown(fileData).trim();

    expect(markdownOutput).toBe(expectedOutput);
  });

  test('should log success message on successful markdown generation', () => {
    const fileData = [{ path: 'success.txt', content: 'Success content' }];
    
    const markdownGenerator = new MarkdownGenerator();
    markdownGenerator.generateMarkdown(fileData);

    expect(logger.debug).toHaveBeenCalledWith('Successfully generated markdown document.');
  });

  test('should throw and log an error if markdown generation fails', () => {
    // Simulate an error by mocking compile to throw
    jest.spyOn(Handlebars, 'compile').mockImplementationOnce(() => {
      throw new Error('Compilation failed');
    });

    try {
      const markdownGenerator = new MarkdownGenerator();
      const fileData = [{ path: 'fail.txt', content: 'Fail content' }];

      expect(() => markdownGenerator.generateMarkdown(fileData)).toThrow('Compilation failed');
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error generating markdown document: Error: Compilation failed'));
    }
    catch (error) {
      // Ensure the error is thrown and logged
      expect(error).toBeInstanceOf(Error);
    }
  });

  // Add more tests as needed to cover various scenarios and edge cases
});