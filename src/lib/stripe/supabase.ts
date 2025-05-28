import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { PlanTier } from './config';
import { withSession, getValidSession } from '../session';
import { DEFAULT_SUBSCRIPTION_STATE, ensureSubscriptionState } from '../subscription';

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

/**
 * Fetches subscription data for the current user
 * @throws {Error} If there's an error fetching the subscription
 */
export const fetchSubscription = async (userId: string): Promise<SubscriptionStatus> => {
  try {
    return await withSession(async (session) => {
      if (session.user.id !== userId) {
        console.warn('User ID mismatch between session and request');
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Handle specific error codes
        if (['PGRST116', 'P0002', '22P02'].includes(error.code || '')) {
          // No subscription found or invalid input
          return DEFAULT_SUBSCRIPTION_STATE;
        }
        console.error('Subscription fetch error:', error);
        throw error;
      }

      if (!subscription) {
        return DEFAULT_SUBSCRIPTION_STATE;
      }

      const sub = subscription as unknown as StripeSubscription;
      
      return {
        isActive: sub.status === 'active',
        plan: getPlanFromPriceId(sub.price_id),
        interval: sub.interval,
        currentPeriodEnd: sub.current_period_end,
        isCanceled: sub.cancel_at_period_end,
      };
    });
  } catch (error) {
    console.error('Error in fetchSubscription:', error);
    throw new Error('Failed to fetch subscription data');
  }
};

interface UseSubscriptionOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export const useSubscription = ({
  enabled = true,
  onError,
}: UseSubscriptionOptions = {}) => {
  return useQuery<SubscriptionStatus, Error>({
    queryKey: ['subscription'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      try {
        const session = await getValidSession();
        return fetchSubscription(session.user.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const subscriptionError = new Error(`Failed to load subscription: ${errorMessage}`);
        
        if (onError) {
          onError(subscriptionError);
        } else {
          console.error('Error in useSubscription:', subscriptionError);
        }
        
        // Return default state but still propagate the error
        // This allows components to handle the error while still having a valid state
        return DEFAULT_SUBSCRIPTION_STATE;
      }
    },
    enabled,
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (error.message.includes('No active session') || 
          error.message.includes('Failed to get session')) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
