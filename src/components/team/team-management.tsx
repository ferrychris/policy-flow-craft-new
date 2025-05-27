import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/organization-context';
import { OrganizationMember, MemberRole } from '@/types/member';
import { OrganizationMemberService } from '@/lib/services/organization-member';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Loader2, Trash2 } from 'lucide-react';

export function TeamManagement() {
  const { currentOrganization } = useOrganization();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [userRole, setUserRole] = useState<MemberRole | null>(null);

  useEffect(() => {
    if (currentOrganization) {
      loadMembers();
      loadUserRole();
    }
  }, [currentOrganization]);

  const loadMembers = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      const orgMembers = await OrganizationMemberService.getByOrganization(currentOrganization.id);
      setMembers(orgMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRole = async () => {
    if (!currentOrganization) return;
    
    try {
      const role = await OrganizationMemberService.getCurrentUserRole(currentOrganization.id);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const handleInvite = async () => {
    if (!currentOrganization) return;
    
    try {
      await OrganizationMemberService.inviteMember(
        currentOrganization.id,
        inviteEmail,
        inviteRole
      );
      toast.success('Team member invited successfully');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('member');
      loadMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to invite team member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await OrganizationMemberService.remove(memberId);
      toast.success('Team member removed successfully');
      loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      await OrganizationMemberService.update(memberId, { role });
      toast.success('Member role updated successfully');
      loadMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update member role');
    }
  };

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select an organization to manage team members</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Management</h2>
        {userRole === 'admin' && (
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {userRole === 'admin' && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {member.user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.user?.user_metadata?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {userRole === 'admin' ? (
                    <Select
                      value={member.role}
                      onValueChange={(value: MemberRole) => handleRoleChange(member.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="capitalize">{member.role}</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(member.created_at).toLocaleDateString()}
                </TableCell>
                {userRole === 'admin' && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Invite a new member to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role">Role</label>
              <Select value={inviteRole} onValueChange={(value: MemberRole) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
