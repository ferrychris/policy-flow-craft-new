import { MemberRole } from './member';

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface OrganizationInvitation {
  id: string;
  invited_email: string;
  organization_id: string;
  role: MemberRole;
  accepted: boolean;
  created_at: string;
  token: string;
  email: string;
  invited_by: string;
  status: InvitationStatus;
  
  // Joined fields
  organization?: {
    name: string;
  };
  inviter?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface CreateInvitationInput {
  invited_email: string;
  organization_id: string;
  role?: MemberRole;
}
