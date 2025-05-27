export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled';
export type PlanType = 'free' | 'pro' | 'enterprise';
export type UserRole = 'admin' | 'member';

export interface Profile {
  id: string;
  user_id: string;
  organization_id?: string;
  stripe_customer_id?: string;
  
  // Profile information
  name: string;
  email: string;
  role: UserRole;
  metadata?: {
    avatar_url?: string;
    email_notifications?: boolean;
  };
  
  // Subscription details
  plan: PlanType;
  tier_level: number;
  subscription_status: SubscriptionStatus;
  
  // Trial information
  trial_tier?: string;
  trial_start?: Date;
  trial_end?: Date;
  trial_ends_at?: Date;
  
  // Timestamps
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}
