import pino from 'pino';
import { isDev } from '../config/env';

const logger = pino({
  name: 'app',
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined
});

export default logger;
