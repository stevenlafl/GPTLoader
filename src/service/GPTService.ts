import OpenAI from 'openai';
import { logger } from '../util/LoggerFactory';
import { ChatCompletionChunk } from 'openai/resources/chat/completions';
import { Stream } from 'openai/streaming'

export class GPTService {

  private DEBUG:boolean;
  private openai;

  constructor(DEBUG:boolean = false) {
    this.DEBUG = DEBUG;

    if (this.DEBUG) {
      this.openai = new OpenAI({
          organization: 'TEST',
          apiKey: 'TEST',
      });
    }
    else {
      this.openai = new OpenAI({
          organization: process.env.OPENAI_ORGANIZATION,
          apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async getModels(): Promise<string[]> {
    if (this.DEBUG) {
      return ['gpt-3.5-turbo', 'gpt-4'];
    }

    const response = await this.openai.models.list();
    const models = response.data;
    return models.map((model) => model.id);
  }

  async getChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<OpenAI.Chat.Completions.ChatCompletion.Choice> {
    if (this.DEBUG) {
      return {
        "message":{"refusal": null,"role":"assistant","content":"Mocked Response"},"finish_reason":"stop","index":0,"logprobs": null};
    }

    logger.debug(`Processing chat completion...`);
    const response = await this.openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages,
    });
    logger.debug(`Chat completion is finished...`);

    return response.choices[0];
  }

  async getChatCompletionStream(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<Stream<ChatCompletionChunk>> {
    logger.debug(`Processing chat completion...`);
    const stream = await this.openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages,
      stream: true,
    });
    logger.debug(`Stream received...`);
    return stream;
  }
}