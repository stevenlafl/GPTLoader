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
import path from 'path';
import { dir } from 'console';
import EventEmitter from 'events';
import { Stream } from 'openai/streaming';

async function main() {

  // Create a flag to indicate whether a GPT request is active
  let isActiveGptRequest = false;
  
  // Create an event emitter to handle cancel events
  const cancelEmitter = new EventEmitter();

  process.on('SIGINT', () => {
    if (isActiveGptRequest) {
      // Emit a cancel event that can be handled by your GPT service
      cancelEmitter.emit('cancel');
    } else {
      // If there is no active GPT request, exit the program
      process.exit(0);
    }
  });

  try {
    logger.debug('Starting GPTLoader application...');

    // Parse command line arguments
    const argv = await yargs(hideBin(process.argv))
      .usage(`Usage: $0 <dirname> [options]`)
      .command('$0 <dirname>', 'Load the specified directory into the app', (yargs) => {
        yargs.positional('dirname', {
          describe: 'Directory to load',
          type: 'string'
        })
      })
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
      .option('output-prompt', {
        alias: 'op',
        describe: 'Prompt to use for output',
        type: 'string',
        default: 'prompt.md'
      })
      .help('help')
      .wrap(null)
      .parse();

    logger.debug('Parsed command-line arguments... ', argv);

    const directoryToLoad = typeof argv.dirname === 'string' ? path.resolve(process.cwd(), argv.dirname) : process.cwd();

    const gpt = new GPTService(process.env.DEBUG === 'true');
    let chatHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    try {
      const fileReader = new FileReader(argv);
      const files = await fileReader.readFileContents(directoryToLoad);
      logger.info(`Files read: \n  ${files.map(f => f.path).join("\n  ")}`);
    } catch (error: any) {
      if (error.message?.includes('Total file size exceeds the 1MB limit')) {
        console.error('The total file size of the files is too large. Consider adding some files to .gptignore to reduce the size.');
        process.exit(1); // Exit the program if the file size is too large
      }
      throw error; // If it is a different error, rethrow it
    }
    
    // Instantiate MarkdownGenerator
    const markdownGenerator = new MarkdownGenerator();

    // Continuous loop
    while (true) {

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
      
      // Instantiate FileReader
      const fileReader = new FileReader(argv);

      // Step 1: Invoke the FileReader after prompting for the question
      const files = await fileReader.readFileContents(directoryToLoad);
      logger.info(`Files read: \n  ${files.map(f => f.path).join("\n  ")}`);

      // Step 2: Pass the list of files to the MarkdownGenerator
      const markdown = markdownGenerator.generateMarkdown(files);
      logger.debug(`Markdown document generated.`);

      // if output prompt is specified, write the prompt to the file
      if (argv['output-prompt']) {
        fs.writeFileSync(argv['output-prompt'], markdown);
        return;
      }

      // Set flag to indicate active GPT request
      isActiveGptRequest = true;

      let prompt: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {role: "system", content: "You are reviewing files and have a question from the user."},
        {role: "system", content: "Here are the files and their contents: \n\n" + markdown},
        ...chatHistory,
        {role: "user", content: response.question}
      ];
      
      // Process the question with GPT
      let stream = await gpt.getChatCompletionStream(prompt)

      let gptResponse = await new Promise<OpenAI.Chat.Completions.ChatCompletion.Choice | null>(async (resolve, reject) => {
        // Listen for a cancel event
        let cancelled = false;
        cancelEmitter.once('cancel', () => {
          // Cancel GPT response/request here
          // E.g., resolve with a cancellation message or reject
          cancelled = true;
          resolve(null);
        });

        let fullMessage = '';
        let lastChunk: OpenAI.Chat.Completions.ChatCompletionChunk | null = null;
        for await (const chunk of stream) {

          if (cancelled) {
            break;
          }

          lastChunk = chunk;
          fullMessage += chunk.choices[0]?.delta?.content || '';
          process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }

        if (lastChunk !== null) {
          let lastChoice: OpenAI.Chat.Completions.ChatCompletion.Choice = {
            index: 0,
            finish_reason: 'stop',
            message: {
              refusal: null,
              role: "assistant",
              content: fullMessage
            },
            logprobs: null
          }

          resolve(lastChoice)
        }

        resolve(null)
      });

      // Reset flag after response is received
      isActiveGptRequest = false;

      if (gptResponse === null) {
        continue;
      }

      // Update chat history with the new question and GPT's response
      chatHistory.push({role: "user", content: response.question});
      if (gptResponse.message && gptResponse.message.content) {
        chatHistory.push({role: "system", content: gptResponse.message.content});
      }

      console.log(gptResponse.message.content);
    }

    logger.debug('GPTLoader application completed successfully.');
  } catch (error) {
    // Reset flag in case of error as well
    isActiveGptRequest = false;
    logger.error(`An error occurred: ${error}`);
  }
}

main().catch(error => logger.error(`Unhandled error: ${error.message}\n${error.stack}`));