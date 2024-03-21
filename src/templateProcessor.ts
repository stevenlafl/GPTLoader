import Handlebars from 'handlebars';
import { logger } from './logger';

// Register a helper to escape backticks to ensure markdown code blocks are properly formatted.
Handlebars.registerHelper('escapeBackticks', (text: string) => new Handlebars.SafeString(text.replace(/`/g, '\\`')));

// Define a Handlebars template for generating the markdown document.
const markdownTemplate = `
# GPTLoader Output

{{#each files}}
## File: {{path}}
\`\`\`
{{escapeBackticks content}}
\`\`\`
{{/each}}
`;

// Compile the template
const template = Handlebars.compile(markdownTemplate);

// Function that takes the file data array from the FileReader and returns a markdown string.
export const generateMarkdown = (fileData: { path: string; content: string }[]): string => {
    try {
        // Use the compiled template with the provided file data
        const markdownOutput = template({ files: fileData });
        logger.info('Successfully generated markdown document.');
        return markdownOutput;
    } catch (error) {
        logger.error(`Error generating markdown document: ${error}`);
        throw error; // Rethrowing the error to ensure it can be caught and handled upstream.
    }
};