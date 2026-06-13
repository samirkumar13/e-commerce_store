import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import logger from '../logger';
import { Sentry } from '../sentry';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err instanceof Error ? err.message : 'Internal Server Error';

  // Server-side faults get logged (and reported to Sentry when configured);
  // client errors (4xx) are expected and don't need the noise.
  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, message);
    if (process.env.SENTRY_DSN) Sentry.captureException(err);
  }

  res.status(statusCode).json({
    message,
    stack:
      process.env.NODE_ENV === 'production'
        ? undefined
        : err instanceof Error
          ? err.stack
          : undefined,
  });
};
