import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { PlanTier } from './config';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: PlanTier | null;
  interval: 'month' | 'year';
  currentPeriodEnd: string | null;
  isCanceled: boolean;
}

interface StripeSubscription {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string;
  price_id: string;
  interval: 'month' | 'year';
}

const getPlanFromPriceId = (priceId: string): PlanTier | null => {
  if (priceId === process.env.VITE_STRIPE_FOUNDATIONAL_PRICE_ID) return 'FOUNDATIONAL';
  if (priceId === process.env.VITE_STRIPE_OPERATIONAL_PRICE_ID) return 'OPERATIONAL';
  if (priceId === process.env.VITE_STRIPE_STRATEGIC_PRICE_ID) return 'STRATEGIC';
  return null;
};

// Separate function to fetch subscription data that can be used outside React components
export const fetchSubscription = async (userId: string): Promise<SubscriptionStatus> => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error;
  }

  if (!subscription) {
    return {
      isActive: false,
      plan: null,
      interval: 'month',
      currentPeriodEnd: null,
      isCanceled: false,
    };
  }

  const sub = subscription as unknown as StripeSubscription;
  
  return {
    isActive: sub.status === 'active',
    plan: getPlanFromPriceId(sub.price_id),
    interval: sub.interval,
    currentPeriodEnd: sub.current_period_end,
    isCanceled: sub.cancel_at_period_end,
  };
};

export const useSubscription = (enabled = true) => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }
      return fetchSubscription(session.user.id);
    },
    enabled,
  });
};
