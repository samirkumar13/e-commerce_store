import * as Sentry from '@sentry/node';
import config from './config';

// Error tracking is opt-in: it only activates when SENTRY_DSN is set, so local
// development and self-hosted deploys without a DSN are unaffected.
export const initSentry = (): boolean => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: config.nodeEnv,
    tracesSampleRate: 0.1,
  });
  return true;
};

export { Sentry };
