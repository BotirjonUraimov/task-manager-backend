import { NextFunction, Request, Response } from 'express';
import logger from '../lib/logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  logger.error({ err }, 'Unhandled error');
  res.status(status).json({ error: message });
}
