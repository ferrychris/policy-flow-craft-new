import { supabase } from '../supabase/client';
import { 
  OrganizationMember, 
  CreateMemberInput, 
  UpdateMemberInput,
  MemberRole 
} from '@/types/member';

export class OrganizationMemberService {
  static async create(input: CreateMemberInput): Promise<OrganizationMember> {
    const { data, error } = await supabase
      .from('organization_members')
      .insert({
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*, user:auth.users(email, user_metadata)')
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, input: UpdateMemberInput): Promise<OrganizationMember> {
    const { data, error } = await supabase
      .from('organization_members')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, user:auth.users(email, user_metadata)')
      .single();

    if (error) throw error;
    return data;
  }

  static async getByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*, user:auth.users(email, user_metadata)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async inviteMember(
    organizationId: string, 
    email: string, 
    role: MemberRole = 'member'
  ): Promise<void> {
    // First check if user exists
    const { data: users } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (!users) {
      throw new Error('User not found');
    }

    // Then create member
    await this.create({
      organization_id: organizationId,
      user_id: users.id,
      role
    });
  }

  static async getCurrentUserRole(organizationId: string): Promise<MemberRole | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;
    return data.role as MemberRole;
  }
}
