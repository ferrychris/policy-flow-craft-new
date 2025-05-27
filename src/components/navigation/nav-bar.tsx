import { useNavigate } from 'react-router-dom';
import { useOrganization } from '@/contexts/organization-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileDialog } from '@/components/profile/profile-dialog';
import { InvitationBell } from '@/components/invitation/invitation-bell';
import { OrganizationMemberService } from '@/lib/services/organization-member';
import { MemberRole } from '@/types/member';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TeamChat } from '@/components/team/team-chat';
import {
  LayoutGrid,
  Users,
  
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Plus,
  Search,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function NavBar() {
  const navigate = useNavigate();
  const { currentOrganization, organizations, setCurrentOrganization } = useOrganization();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userRole, setUserRole] = useState<MemberRole | null>(null);
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentOrganization) {
      loadUserRole();
    }
  }, [currentOrganization]);

  const loadUserRole = async () => {
    if (!currentOrganization) return;
    try {
      const role = await OrganizationMemberService.getCurrentUserRole(currentOrganization.id);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      navigate('/sign-in');
    }
  };

  return (
    <nav className="border-b">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[200px] justify-start">
                <Building2 className="w-4 h-4 mr-2" />
                {currentOrganization?.name || 'Select Organization'}
                <ChevronDown className="w-4 h-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px] p-2">
              <div className="flex items-center px-2 pb-2">
                <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              <DropdownMenuSeparator />
              {organizations
                .filter(org => org.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => setCurrentOrganization(org)}
                    className="p-2"
                  >
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {org.name}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowNewOrgDialog(true)}
                className="p-2 text-[#8a63d2]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "hover:bg-[#8a63d2]/10 hover:text-[#8a63d2]",
              location.pathname === "/dashboard" && "bg-[#8a63d2]/10 text-[#8a63d2]"
            )}
            onClick={() => navigate('/dashboard')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Dashboard
          </Button>

          {currentOrganization && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-[#8a63d2]/10 hover:text-[#8a63d2]",
                  location.pathname === "/organization/teams" && "bg-[#8a63d2]/10 text-[#8a63d2]"
                )}
                onClick={() => navigate('/organization/teams')}
              >
                <Users className="w-4 h-4 mr-2" />
                Teams
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-[#8a63d2]/10 hover:text-[#8a63d2]",
                  location.pathname === "/organization/policies" && "bg-[#8a63d2]/10 text-[#8a63d2]"
                )}
                onClick={() => navigate('/organization/policies')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Policies
              </Button>
            </>
          )}

          {userRole === 'admin' && currentOrganization && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "hover:bg-[#8a63d2]/10 hover:text-[#8a63d2]",
                location.pathname === "/settings" && "bg-[#8a63d2]/10 text-[#8a63d2]"
              )}
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <TeamChat />
          <InvitationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Account
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </nav>
  );
}
