import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface Organization {
  id: string;
  name: string;
  stripe_customer_id: string | null;
}

export function useOrganization() {
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      return data as Organization[];
    },
  });

  const { data: currentOrg } = useQuery({
    queryKey: ['current-organization'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('user_organizations')
        .select('organization_id, organizations(*)')
        .eq('user_id', session.user.id)
        .eq('is_current', true)
        .single();

      if (error) throw error;
      return data.organizations as Organization;
    },
  });

  const switchOrganization = useMutation({
    mutationFn: async (organizationId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // First, set all organizations to not current
      await supabase
        .from('user_organizations')
        .update({ is_current: false })
        .eq('user_id', session.user.id);

      // Then set the selected organization as current
      const { error } = await supabase
        .from('user_organizations')
        .update({ is_current: true })
        .eq('user_id', session.user.id)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-organization'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  return {
    organizations,
    currentOrg,
    switchOrganization,
    isLoading,
  };
}
