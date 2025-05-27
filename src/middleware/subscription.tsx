import { useSubscription } from '../lib/stripe/supabase';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';
import { STRIPE_PLANS } from '../lib/stripe/config';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  minimumTier?: keyof typeof STRIPE_PLANS;
}

const tierLevels: Record<keyof typeof STRIPE_PLANS, number> = {
  FOUNDATIONAL: 1,
  OPERATIONAL: 2,
  STRATEGIC: 3,
};

export function RequireSubscription({ children, minimumTier = 'FOUNDATIONAL' }: RequireSubscriptionProps) {
  const { data: subscription, isLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!subscription?.isActive || !subscription.plan)) {
      navigate('/pricing?message=subscription-required');
      return;
    }

    if (
      !isLoading &&
      subscription?.plan &&
      tierLevels[subscription.plan] < tierLevels[minimumTier]
    ) {
      navigate('/pricing?message=upgrade-required');
    }
  }, [subscription, isLoading, minimumTier, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Loading subscription data...</span>
      </div>
    );
  }

  if (!subscription?.isActive || !subscription.plan) {
    return null;
  }

  if (tierLevels[subscription.plan] < tierLevels[minimumTier]) {
    return null;
  }

  return <>{children}</>;
}
