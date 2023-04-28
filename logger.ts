const winston = require('winston');
const fs = require('fs');
const path = require('path');

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'app.log');

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

const fileTransport = new winston.transports.File({
  filename: logFile,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }: print) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [consoleTransport, fileTransport],
  exceptionHandlers: [consoleTransport, fileTransport],
  exitOnError: false,
});

winston.addColors({
  debug: 'grey',
  info: 'cyan',
  warning: 'yellow',
  error: 'red',
  critical: 'red',
});

module.exports = { logger };

export {};
