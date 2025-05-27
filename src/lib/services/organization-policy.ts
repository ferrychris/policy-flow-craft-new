import { supabase } from '../supabase/client';
import { 
  OrganizationPolicy, 
  CreateOrganizationPolicyInput, 
  UpdateOrganizationPolicyInput,
  PolicyStatus 
} from '@/types/policy';

export class OrganizationPolicyService {
  static async create(input: CreateOrganizationPolicyInput): Promise<OrganizationPolicy> {
    const { data, error } = await supabase
      .from('organization_policies')
      .insert({
        ...input,
        status: 'draft',
        assigned_at: new Date().toISOString(),
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, input: UpdateOrganizationPolicyInput): Promise<OrganizationPolicy> {
    const { data, error } = await supabase
      .from('organization_policies')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getById(id: string): Promise<OrganizationPolicy | null> {
    const { data, error } = await supabase
      .from('organization_policies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getByOrganization(organizationId: string): Promise<OrganizationPolicy[]> {
    try {
      // Use a raw SQL query to work around the type mismatch
      // This allows us to cast the organization_id to the appropriate type
      const { data, error } = await supabase
        .rpc('get_organization_policies_by_org_id', {
          org_id: organizationId
        });

      if (error) {
        // If the RPC function doesn't exist, fall back to a more generic approach
        console.error('Error using RPC function, falling back to alternative method:', error);
        
        // Try a direct query with text casting
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('organization_policies')
          .select('*')
          .filter('organization_id::text', 'eq', organizationId)
          .order('assigned_at', { ascending: false });
          
        if (fallbackError) {
          console.error('Error in fallback query:', fallbackError);
          return [];
        }
        
        return fallbackData || [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getByOrganization:', err);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  static async updateStatus(id: string, status: PolicyStatus): Promise<void> {
    const { error } = await supabase
      .from('organization_policies')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_policies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async assignToOrganization(
    policyId: string, 
    organizationId: string,
    title: string,
    type: string
  ): Promise<OrganizationPolicy> {
    const { data, error } = await supabase
      .from('organization_policies')
      .insert({
        policy_id: policyId,
        organization_id: organizationId,
        title,
        type,
        status: 'draft',
        assigned_at: new Date().toISOString(),
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
