import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TeamInviteDialog } from '@/components/TeamInviteDialog';
import { useOrganization } from '@/contexts/organization-context';
import { OrganizationMemberService } from '@/lib/services/organization-member';
import { supabase } from '@/lib/supabase/client';

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
}

export function TeamChat() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (member: TeamMember) => {
    const name = member.user.user_metadata?.full_name || member.user.email;
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <Popover open={chatOpen} onOpenChange={setChatOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="h-5 w-5" />
            {members.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#8a63d2] text-[10px] font-medium text-white flex items-center justify-center">
                {members.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Team Chat</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#8a63d2]"
                onClick={() => setShowInvite(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex -space-x-2">
              {members.map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                  {member.user.user_metadata?.avatar_url ? (
                    <AvatarImage src={member.user.user_metadata.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-[#8a63d2] text-white">
                      {getInitials(member)}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
            </div>
          </div>
          <ScrollArea className="h-[300px] p-4">
            <div className="space-y-4">
              {/* Chat messages will go here */}
              <p className="text-sm text-center text-muted-foreground">
                No messages yet
              </p>
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button size="icon" className="bg-[#8a63d2] hover:bg-[#7a53c2]">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <TeamInviteDialog
        open={showInvite}
        onOpenChange={setShowInvite}
      />
    </>
  );
}
