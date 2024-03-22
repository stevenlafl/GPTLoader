import dotenv from 'dotenv';
dotenv.config();

import { FileReader } from './util/FileReader';
import { MarkdownGenerator } from './util/MarkdownGenerator';
import OpenAI from 'openai';
import { GPTService } from './service/GPTService'; // Assuming you have this
import { logger } from './util/LoggerFactory';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import prompts from 'prompts';

async function main() {
  try {
    logger.debug('Starting GPTLoader application...');

    // Parse command line arguments
    const argv = await yargs(hideBin(process.argv))
      .middleware((argv) => {
        if (argv['ignore-files']) {
          argv['ignore-files'] = (argv['ignore-files'] as string[])
            .flatMap((item) => item.split(','))
            .filter(Boolean);
        }
        if (argv.ignore) {
          argv.ignore = (argv.ignore as string[])
            .flatMap((item) => item.split(','))
            .filter(Boolean);
        }
      })
      .option('ignore', {
        alias: 'i',
        describe: 'Additional ignore patterns',
        type: 'array',
        default: []
      })
      .option('ignore-files', {
        alias: 'if',
        describe: 'Ignore files to load patterns from',
        type: 'array',
        default: ['.gitignore', '.dockerignore', '.gptignore']
      })
      .parse();

    logger.debug('Parsed command-line arguments... ', argv);

    const gpt = new GPTService();
    let chatHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Continuous loop
    while (true) {
      // Instantiate FileReader and MarkdownGenerator
      const fileReader = new FileReader(argv);
      const markdownGenerator = new MarkdownGenerator();

      // Step 1: Invoke the FileReader
      const files = await fileReader.readFileContents();
      logger.info(`Files read: \n  ${files.map(f => f.path).join("\n  ")}`);

      // Step 2: Pass the list of files to the MarkdownGenerator
      const markdown = markdownGenerator.generateMarkdown(files);
      logger.debug(`Markdown document generated.`);

      // Prompt the user for a question
      const response = await prompts({
        type: 'text',
        name: 'question',
        message: 'What do you want to ask? (Type "quit" to exit)'
      });

      if (response.question === undefined) {
        break;
      }
      if (response.question.toLowerCase() === "quit" || response.question.toLowerCase() === "exit" || response.question.toLowerCase() === "q") {
        break;
      }
      if (!response.question) {
        continue;
      }

      // Process the question with GPT
      let gptResponse = await gpt.getChatCompletion([
        {role: "system", content: "You are reviewing files and have a question from the user."},
        {role: "system", content: "Here are the files and their contents: \n\n" + markdown},
        ...chatHistory,
        {role: "user", content: response.question}
      ]);

      // Update chat history with the new question and GPT's response
      chatHistory.push({role: "user", content: response.question});
      if (gptResponse.message && gptResponse.message.content) {
        chatHistory.push({role: "system", content: gptResponse.message.content});
      }

      console.log(gptResponse.message.content);
    }

    logger.debug('GPTLoader application completed successfully.');
  } catch (error) {
    logger.error(`An error occurred: ${error}`);
  }
}

main().catch(error => logger.error(`Unhandled error: ${error.message}\n${error.stack}`));