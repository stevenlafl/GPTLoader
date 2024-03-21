import winston from 'winston';
import { LoggerFactory } from '../src/util/LoggerFactory';

// Mock winston module
jest.mock('winston', () => {
  const mFormat = {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    splat: jest.fn(),
    json: jest.fn(),
    simple: jest.fn(),
  };
  return {
    format: mFormat,
    createLogger: jest.fn().mockReturnValue({
      add: jest.fn(),
    }),
    transports: {
      File: jest.fn(),
      Console: jest.fn(),
    },
  };
});

describe('LoggerFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks(); // Most important - it clears the cache
    process.env = { ...originalEnv }; // Make a copy
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env
  });

  test('should create a logger with file transports in non-production environment', async () => {
    process.env.NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'debug';

    const loggerFactory = new LoggerFactory();
    LoggerFactory.reset();
    const logger = loggerFactory.getLogger();

    expect(winston.createLogger).toHaveBeenCalledWith(expect.objectContaining({
      level: 'debug',
      transports: expect.arrayContaining([
        expect.any(Object),
        expect.any(Object),
      ]),
    }));

    expect(winston.transports.File).toHaveBeenCalledWith(expect.objectContaining({
      filename: expect.stringContaining('error.log'),
      level: 'error',
    }));

    expect(winston.transports.File).toHaveBeenCalledWith(expect.objectContaining({
      filename: expect.stringContaining('combined.log'),
    }));

    expect(winston.transports.Console).toHaveBeenCalled();
  });

  test('should create a logger without console transport in production environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'silent';

    const loggerFactory = new LoggerFactory();
    LoggerFactory.reset();
    const logger = loggerFactory.getLogger();

    console.warn(winston.createLogger);

    expect(winston.createLogger).toHaveBeenCalled();
    expect(winston.transports.Console).not.toHaveBeenCalled();
  });

  // Add more tests as needed to cover various scenarios and configurations
});