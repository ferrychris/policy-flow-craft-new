import { handleStripeWebhook } from './api/stripe/webhooks';
import { createPortalSession } from './api/stripe/create-portal-session';

export const routes = {
  '/api/stripe/webhooks': {
    POST: handleStripeWebhook,
  },
  '/api/stripe/create-portal-session': {
    POST: createPortalSession,
  },
} as const;
