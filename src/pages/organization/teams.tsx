import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamInviteDialog } from '@/components/TeamInviteDialog';
import { useOrganization } from '@/contexts/organization-context';
import { OrganizationMemberService } from '@/lib/services/organization-member';
import { supabase } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  user: {
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  role: string;
  created_at: string;
}

export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (currentOrganization) {
      loadMembers();
    }
  }, [currentOrganization]);

  const loadMembers = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      const { data: members, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          created_at,
          user:user_id (
            email,
            user_metadata
          )
        `)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
      setMembers(members || []);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await OrganizationMemberService.updateRole(memberId, newRole);
      toast.success('Member role updated successfully');
      loadMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await OrganizationMemberService.remove(memberId);
      toast.success('Member removed successfully');
      loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const filteredMembers = members.filter(member => 
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.user_metadata?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your organization's team members and their roles.
          </p>
        </div>
        <Button
          onClick={() => setShowInvite(true)}
          className="bg-[#8a63d2] hover:bg-[#7a53c2]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {member.user.user_metadata?.avatar_url ? (
                        <AvatarImage src={member.user.user_metadata.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-[#8a63d2] text-white">
                          {member.user.user_metadata?.full_name?.[0] || member.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      {member.user.user_metadata?.full_name && (
                        <div className="font-medium">{member.user.user_metadata.full_name}</div>
                      )}
                      <div className="text-sm text-muted-foreground">{member.user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#8a63d2]" />
                    {member.role}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(member.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}
                      >
                        Change to {member.role === 'admin' ? 'Member' : 'Admin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TeamInviteDialog
        open={showInvite}
        onOpenChange={setShowInvite}
      />
    </div>
  );
}
