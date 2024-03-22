import winston from 'winston';
import path from 'path';

class LoggerFactory {
  static serviceName: string;
  static logger: winston.Logger;

  constructor(serviceName: string = 'GPTLoader') {
    if (!LoggerFactory.logger || !LoggerFactory.serviceName) {
      LoggerFactory.serviceName = serviceName;
      LoggerFactory.logger = this.createLogger();
    }
  }

  private createLogger() {
    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: LoggerFactory.serviceName },
      transports: [
        new winston.transports.File({ filename: path.join(__dirname, '..', 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, '..', 'combined.log') }),
      ],
    });

    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
        stderrLevels: ['error'],
      }),
    );

    return logger;
  }

  public getLogger() {
    if (LoggerFactory.logger) {
      return LoggerFactory.logger;
    }
    else {
      return this.createLogger();
    }
  }

  public static reset() {
    LoggerFactory.logger = false as unknown as winston.Logger;
  }
}

export { LoggerFactory };

export const logger = new LoggerFactory().getLogger();