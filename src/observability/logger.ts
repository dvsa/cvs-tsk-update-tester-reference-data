import { createLogger, format, transports } from 'winston';
import config from '../config';

const { printf } = format;

const logFormat = printf((info: { level: string; message: string; stack?: string }) => {
  // Checks if log is an error - has stack info
  if (info.stack) {
    return `${info.level}: ${info.stack}`;
  }
  return `${info.level}: ${info.message}`;
});

const loggerConfig = {
  level: config.logger.logLevel,
  format: logFormat,
};

const logger = createLogger();
logger.add(new transports.Console(loggerConfig));

export default logger;
