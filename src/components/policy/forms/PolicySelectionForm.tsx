import { UseFormReturn } from 'react-hook-form';
import { useSubscription } from '@/lib/stripe/supabase';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PolicyFormData } from '../types';

// Define available policies per subscription tier
const POLICY_TIERS = {
  FOUNDATIONAL: [
    'Information Security Policy',
    'Acceptable Use Policy',
    'Password Policy',
  ],
  OPERATIONAL: [
    'Information Security Policy',
    'Data Protection Policy',
    'Acceptable Use Policy',
    'Password Policy',
    'Remote Work Policy',
    'Access Control Policy',
  ],
  STRATEGIC: [
    'Information Security Policy',
    'Data Protection Policy',
    'Acceptable Use Policy',
    'Password Policy',
    'Remote Work Policy',
    'Incident Response Policy',
    'Business Continuity Policy',
    'Access Control Policy',
  ],
  // Free tier or no subscription
  FREE: [
    'Information Security Policy',
    'Acceptable Use Policy',
  ],
} as const;

// Get all available policies for the current subscription tier
const getAvailablePolicies = (tier: keyof typeof POLICY_TIERS | null) => {
  if (!tier) return POLICY_TIERS.FREE;
  return POLICY_TIERS[tier] || POLICY_TIERS.FREE;
};

const regulations = [
  'GDPR',
  'HIPAA',
  'CCPA',
  'SOX',
  'PCI DSS',
  'ISO 27001',
];

const standards = [
  'NIST Cybersecurity Framework',
  'ISO 27001',
  'SOC 2',
  'CIS Controls',
  'COBIT',
];

interface PolicySelectionFormProps {
  form: UseFormReturn<PolicyFormData>;
  disabled?: boolean;
}

export function PolicySelectionForm({ form, disabled = false }: PolicySelectionFormProps) {
  const { data: subscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  // Get available policies based on subscription tier
  const availablePolicies = getAvailablePolicies(subscription?.plan || null);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentPath = window.location.pathname;
    const isInDashboard = currentPath.startsWith('/dashboard');
    
    if (isInDashboard) {
      navigate('pricing'); // Relative path when already in dashboard
    } else {
      navigate('/dashboard/pricing'); // Full path when not in dashboard
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="selectedPolicies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Policies</FormLabel>
            <FormControl>
              <MultiSelect
                placeholder="Select policies"
                options={availablePolicies.map((policy) => ({
                  label: policy,
                  value: policy,
                }))}
                selected={field.value || []}
                onChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
            {!subscription?.isActive && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>Upgrade your plan to access all available policies.</p>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-blue-600"
                  onClick={handleUpgradeClick}
                >
                  Upgrade now
                </Button>
              </div>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="regulations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Applicable Regulations (Optional)</FormLabel>
            <FormControl>
              <MultiSelect
                placeholder="Select regulations"
                options={regulations.map((regulation) => ({
                  label: regulation,
                  value: regulation,
                }))}
                selected={field.value || []}
                onChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="standards"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compliance Standards (Optional)</FormLabel>
            <FormControl>
              <MultiSelect
                placeholder="Select standards"
                options={standards.map((standard) => ({
                  label: standard,
                  value: standard,
                }))}
                selected={field.value || []}
                onChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
