export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET,
};

export const STRIPE_PLANS = {
  FOUNDATIONAL: {
    name: 'Foundational',
    id: import.meta.env.VITE_STRIPE_FOUNDATIONAL_PRICE_ID as string,
    price: 49,
    description: 'Perfect for individuals and small teams getting started with policy management',
    features: [
      'Basic policy templates',
      'Single user access',
      'Standard support',
      'Up to 3 policies per month',
    ],
  },
  OPERATIONAL: {
    name: 'Operational',
    id: import.meta.env.VITE_STRIPE_OPERATIONAL_PRICE_ID as string,
    price: 99,
    description: 'Ideal for growing teams that need more flexibility and customization',
    features: [
      'Advanced policy templates',
      'Up to 5 team members',
      'Priority support',
      'Up to 10 policies per month',
      'Custom branding',
    ],
  },
  STRATEGIC: {
    name: 'Strategic',
    id: import.meta.env.VITE_STRIPE_STRATEGIC_PRICE_ID as string,
    price: 199,
    description: 'Enterprise-grade solution for organizations that need full control and scalability',
    features: [
      'Enterprise-grade templates',
      'Unlimited team members',
      '24/7 premium support',
      'Unlimited policies',
      'Custom branding',
      'API access',
      'Dedicated success manager',
    ],
  },
} as const;

export type PlanTier = keyof typeof STRIPE_PLANS;

export interface SubscriptionStatus {
  isActive: boolean;
  plan: PlanTier | null;
  interval: 'month' | 'year';
  currentPeriodEnd: string | null;
  isCanceled: boolean;
}
