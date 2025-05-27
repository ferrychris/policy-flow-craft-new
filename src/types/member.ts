export type MemberRole = 'admin' | 'member';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  updated_at: string;
  parent_member_id?: string;
  
  // Joined fields
  user?: {
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface CreateMemberInput {
  organization_id: string;
  user_id: string;
  role?: MemberRole;
  parent_member_id?: string;
}

export interface UpdateMemberInput {
  role?: MemberRole;
  parent_member_id?: string;
}
