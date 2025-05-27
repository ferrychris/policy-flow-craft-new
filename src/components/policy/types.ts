import { z } from 'zod';

export const policySchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  website: z.string().url('Must be a valid URL').or(z.literal('')),
  industrySector: z.string().min(1, 'Industry sector is required'),
  organizationSize: z.string().min(1, 'Organization size is required'),
  geographicOperations: z.array(z.string()).min(1, 'Select at least one region'),
  regulations: z.array(z.string()),
  standards: z.array(z.string()),
  selectedPolicies: z.array(z.string()).min(1, 'Select at least one policy'),
});

export type PolicyFormData = z.infer<typeof policySchema>;
