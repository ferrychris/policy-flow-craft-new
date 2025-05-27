
import { useState } from "react";
import { Users, Mail, Trash2, Copy, Crown, Shield, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  status: "active" | "pending";
}

const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "John Doe", email: "john.doe@acmecorp.com", role: "owner", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane.smith@acmecorp.com", role: "admin", status: "active" },
  { id: "3", name: "Mike Johnson", email: "mike.johnson@acmecorp.com", role: "member", status: "pending" },
];

interface TeamInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamInviteDialog({ open, onOpenChange }: TeamInviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);

  const handleInvite = () => {
    if (!email.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      role,
      status: "pending",
    };

    setTeamMembers([...teamMembers, newMember]);
    setEmail("");
    toast.success("Team invitation sent!");
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
    toast.success("Team member removed");
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://policyflow.com/invite/abc123");
    toast.success("Invite link copied!");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="w-4 h-4 text-yellow-600" />;
      case "admin": return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      member: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[role as keyof typeof colors] || colors.member;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </DialogTitle>
          <DialogDescription>
            Invite team members and manage permissions for your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Invite Team Members</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyInviteLink}
                className="border-navy-200 text-navy-600 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-400"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Link
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: "admin" | "member") => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleInvite} 
                  className="w-full bg-navy-600 hover:bg-navy-700 text-white"
                  disabled={!email.trim()}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Team Members List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Members ({teamMembers.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{member.name}</p>
                        {member.status === "pending" && (
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <Badge variant="secondary" className={getRoleBadge(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Descriptions */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">Role Permissions</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="w-3 h-3 text-yellow-600" />
                <span><strong>Owner:</strong> Full access to all features and billing</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-600" />
                <span><strong>Admin:</strong> Can manage policies, team members, and settings</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-600" />
                <span><strong>Member:</strong> Can create and edit policies, view team content</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
