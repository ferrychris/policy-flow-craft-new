import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/supabase/client';
import { OrganizationInvitation } from '@/types/invitation';
import { OrganizationInvitationService } from '@/lib/services/organization-invitation';

export function InvitationBell() {
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      setIsLoading(true);
      const pendingInvites = await OrganizationInvitationService.getPendingForEmail(user.email);
      setInvitations(pendingInvites);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (token: string) => {
    try {
      await OrganizationInvitationService.accept(token);
      toast.success('Invitation accepted successfully');
      loadInvitations();
      setOpen(false);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const handleReject = async (token: string) => {
    try {
      await OrganizationInvitationService.reject(token);
      toast.success('Invitation rejected');
      loadInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to reject invitation');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {invitations.length > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#8a63d2] text-[10px] font-medium text-white flex items-center justify-center">
              {invitations.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Organization Invitations</h4>
          {isLoading && <span className="text-sm text-muted-foreground">Loading...</span>}
        </div>
        <Separator className="my-2" />
        {invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending invitations
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex flex-col gap-2 p-2 border rounded-lg">
                  <div>
                    <h5 className="font-medium">{invitation.organization?.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      Invited by {invitation.inviter?.user_metadata?.full_name || invitation.inviter?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[#8a63d2] hover:bg-[#8a63d2]/90"
                      onClick={() => handleAccept(invitation.token)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleReject(invitation.token)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
