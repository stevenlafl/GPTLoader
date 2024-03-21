import { GPTService } from '../src/service/GPTService';

// Mock the OpenAI library
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      models: {
        list: jest.fn().mockResolvedValue({
          data: [
            { id: 'gpt-3.5-turbo' },
            { id: 'gpt-4' },
            // Add more models as needed
          ],
        }),
      },
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async () => {
            return {
              choices: [{
                message: { role: 'assistant', content: 'Mocked Response' },
                finish_reason: 'stop',
                index: 0,
                logprobs: null,
              }]
            };
          })
        }
      }
    };
  });
});

describe('GPTService', () => {
  process.env.OPENAI_ORGANIZATION = 'test';
  process.env.OPENAI_API_KEY = 'test';
  let gptService: GPTService;

  beforeAll(async () => {
    gptService = new GPTService();
  });

  test('getModels should return a list of model IDs', async () => {
    const models = await gptService.getModels();
    expect(models).toEqual(['gpt-3.5-turbo', 'gpt-4']);
  });

  test('getChatCompletion should return a mocked chat completion', async () => {
    const completion = await gptService.getChatCompletion([
      { role: 'user', content: 'Hello, world!'}
    ]);

    expect(completion).toEqual({
      message: { role: 'assistant', content: 'Mocked Response' },
      finish_reason: 'stop',
      index: 0,
      logprobs: null,
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});