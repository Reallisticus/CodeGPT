const winston = require('winston');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');
require('dotenv').config();
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const isProduction = process.env.NODE_ENV === 'production';

type print = {
  timestamp: string;
  level: string;
  message: string;
};

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }: print) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
});

const dailyRotateFileTransport = new DailyRotateFile({
  dirname: logDir,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '7d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }: print) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
});

const logger = winston.createLogger({
  level: isProduction ? 'error' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [consoleTransport, dailyRotateFileTransport],
  exceptionHandlers: [consoleTransport, dailyRotateFileTransport],
  exitOnError: false,
});

winston.addColors({
  debug: 'grey',
  info: 'cyan',
  warning: 'yellow',
  error: 'red',
  critical: 'red',
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { logger };

export {};
