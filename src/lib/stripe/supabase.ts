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

export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

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
    },
  });
};
