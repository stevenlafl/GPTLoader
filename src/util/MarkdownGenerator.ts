import Handlebars from 'handlebars';
import { logger } from './LoggerFactory';

class MarkdownGenerator {
  markdownTemplate: string;
  template: Handlebars.TemplateDelegate<{ files: { path: string; content: string }[] }>;

  constructor() {
    // Register Handlebars helpers within the constructor
    this.registerHelpers();
    // Define the Handlebars template
    this.markdownTemplate = `
# GPTLoader Output

{{#each files}}
## File: {{path}}
\`\`\`
{{escapeBackticks content}}
\`\`\`
{{/each}}
    `;
    // Compile the template
    this.template = Handlebars.compile(this.markdownTemplate);
  }

  registerHelpers() {
    // Register a helper to escape backticks
    Handlebars.registerHelper('escapeBackticks', (text) => 
      new Handlebars.SafeString(text.replace(/`/g, '\\`')));
  }

  generateMarkdown(fileData: { path: string; content: string }[]) {
    try {
      // Use the compiled template with the provided file data
      const markdownOutput = this.template({ files: fileData });
      logger.debug('Successfully generated markdown document.');
      return markdownOutput;
    } catch (error) {
      logger.error(`Error generating markdown document: ${error}`);
      throw error; // Rethrowing the error to ensure it can be caught and handled upstream.
    }
  }
}

export { MarkdownGenerator };