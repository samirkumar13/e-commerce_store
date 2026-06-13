import pino from 'pino';
import config from './config';

const isProd = config.nodeEnv === 'production';

// Pretty, colorized logs in development; structured JSON in production
// (so log aggregators / hosting platforms can parse them).
const logger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
});

export default logger;
