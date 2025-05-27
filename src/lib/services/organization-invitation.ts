import { supabase } from '../supabase/client';
import { 
  OrganizationInvitation, 
  CreateInvitationInput,
  InvitationStatus 
} from '@/types/invitation';

export class OrganizationInvitationService {
  static async create(input: CreateInvitationInput): Promise<OrganizationInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('organization_invitations')
      .insert({
        ...input,
        invited_by: user.id,
        email: input.invited_email,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('*, organization:organizations(name), inviter:auth.users(email, user_metadata)')
      .single();

    if (error) throw error;
    return data;
  }

  static async getPendingForEmail(email: string): Promise<OrganizationInvitation[]> {
    const { data, error } = await supabase
      .from('organization_invitations')
      .select('*, organization:organizations(name), inviter:auth.users(email, user_metadata)')
      .eq('invited_email', email)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }

  static async getByOrganization(organizationId: string): Promise<OrganizationInvitation[]> {
    const { data, error } = await supabase
      .from('organization_invitations')
      .select('*, organization:organizations(name), inviter:auth.users(email, user_metadata)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async accept(token: string): Promise<void> {
    const { data: invitation, error: fetchError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError) throw fetchError;
    if (!invitation) throw new Error('Invitation not found');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Start a transaction
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({
        status: 'accepted',
        accepted: true
      })
      .eq('id', invitation.id);

    if (updateError) throw updateError;

    // Create organization member
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
        created_at: new Date().toISOString()
      });

    if (memberError) throw memberError;
  }

  static async reject(token: string): Promise<void> {
    const { error } = await supabase
      .from('organization_invitations')
      .update({
        status: 'rejected'
      })
      .eq('token', token);

    if (error) throw error;
  }

  static async cancel(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_invitations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
