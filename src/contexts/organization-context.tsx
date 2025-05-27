import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Organization, OrganizationContextType } from '@/types/organization';
import { toast } from 'sonner';

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const loadOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get organizations where user is owner
      const { data: ownedOrgs, error: ownedError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Then get organizations where user is a member through profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      let memberOrgs: Organization[] = [];
      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single();
        
        if (org) memberOrgs = [org];
      }

      const allOrgs = [...(ownedOrgs || []), ...memberOrgs];
      setOrganizations(allOrgs);

      // Set current organization if not set
      if (!currentOrganization && allOrgs.length > 0) {
        setCurrentOrganization(allOrgs[0]);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Failed to load organizations');
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <OrganizationContext.Provider 
      value={{ 
        currentOrganization, 
        setCurrentOrganization, 
        organizations,
        loadOrganizations 
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
