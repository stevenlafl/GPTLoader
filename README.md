# GPTLoader

GPTLoader is a Node.js console application designed to aggregate content from non-binary files within a specified directory. It intelligently excludes files and folders based on patterns defined in .gitignore, .dockerignore, and a custom .gptignore file. The output is a markdown document listing the paths and contents of all included files, primarily serving as a context window for an AI agent.

## Overview

GPTLoader utilizes Node.js for backend logic, incorporating well-known packages such as Winston for logging, Handlebars for markdown document generation, and Ignore for managing exclusion patterns. It's structured to scan the current working directory, apply exclusion patterns, and process all relevant non-binary files. The architecture includes components such as a File Reader, Exclusion Handler, Template Processor, and Logger to efficiently manage the application's operations.

![example-flood](https://github.com/stevenlafl/GPTLoader/assets/2539092/ee345986-8eda-4295-9886-6de0095aa074)

## Features

- **Automatic Directory Scanning:** Operates on the current working directory without the need for user input.
- **Intelligent Exclusion:** Utilizes .gitignore, .dockerignore, and .gptignore files to exclude files and directories.
- **Markdown Output Generation:** Creates a markdown document containing the paths and contents of included files.
- **Real-Time Logging:** Offers progress logs and error tracking in real-time.
- **Conversation History:** Maintains the current conversation in memory even as changes to files during a conversation are reloaded.

## Getting started

### Requirements

- Node.js installed on the computer.
- Basic understanding of terminal or command prompt usage.

### Quickstart

#### Docker
```bash
docker run -it --name gptloader --rm -e LOG_LEVEL=info -e OPENAI_API_KEY="your_api_key" -v "$(pwd):/app" stevenlafl/gptloader
```

You can turn this into a command by altering .bashrc:
```bash
gptloader() {
  docker run -it --name gptloader --rm -e LOG_LEVEL=info -e OPENAI_API_KEY="your_api_key" -v "$(pwd):/app" stevenlafl/gptloader;
}
```

#### NPM

1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Install the required dependencies by running `npm install`.
4. Copy `.env.example` to `.env` and replace relevant variables.
5. Start the application with `npm start`.


### License

Copyright Steven Linn (c) 2024.