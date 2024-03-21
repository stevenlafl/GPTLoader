import OpenAI from 'openai';
import { logger } from '../util/LoggerFactory';

export class GPTService {

  private DEBUG:boolean;
  private openai;

  constructor(DEBUG:boolean = false) {
    this.DEBUG = DEBUG;
    
    this.openai = new OpenAI({
        organization: process.env.OPENAI_ORGANIZATION,
        apiKey: process.env.OPENAI_API_KEY,
    });
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
      return {"message":{"role":"assistant","content":"Mocked Response"},"finish_reason":"stop","index":0,"logprobs": null};
    }

    logger.debug(`Processing chat completion...`);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages,
    });
    logger.debug(`Chat completion is finished...`);

    return response.choices[0];
  }
}