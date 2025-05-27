export type PolicyStatus = 'draft' | 'published' | 'archived';
export type PolicyType = 'ai' | 'privacy' | 'terms' | 'cookie' | 'custom';

export interface BasePolicy {
  id: string;
  title: string;
  description?: string;
  status: PolicyStatus;
  created_at: string;
  updated_at: string;
}

export interface UserPolicy extends BasePolicy {
  user_id: string;
  content: string;
}

export interface OrganizationPolicy extends BasePolicy {
  policy_id: string;
  organization_id: string;
  content: Record<string, any>;
  created_by?: string;
  assigned_at: string;
  type: PolicyType;
}

// Generic Policy type for components that work with any policy type
export type Policy = UserPolicy | OrganizationPolicy;

// Helper type for policy creation
export interface CreateOrganizationPolicyInput {
  title: string;
  description?: string;
  type: PolicyType;
  content: Record<string, any>;
  policy_id: string;
  organization_id: string;
}

// Helper type for policy updates
export interface UpdateOrganizationPolicyInput {
  title?: string;
  description?: string;
  content?: Record<string, any>;
  status?: PolicyStatus;
}
