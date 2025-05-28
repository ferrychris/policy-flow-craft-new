import { SubscriptionStatus } from './stripe/supabase';

export const DEFAULT_SUBSCRIPTION_STATE: SubscriptionStatus = {
  isActive: false,
  plan: null,
  interval: 'month',
  currentPeriodEnd: null,
  isCanceled: false,
};

export const ensureSubscriptionState = (state: Partial<SubscriptionStatus> | null | undefined): SubscriptionStatus => {
  if (!state) return DEFAULT_SUBSCRIPTION_STATE;
  return {
    ...DEFAULT_SUBSCRIPTION_STATE,
    ...state,
  };
};
