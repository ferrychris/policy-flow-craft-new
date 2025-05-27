
import { useState, useEffect } from "react";
import { FileText, Search, Plus, Building2, ChevronDown, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreatePolicyModal } from "@/components/policy/CreatePolicyModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { TeamInviteDialog } from "@/components/TeamInviteDialog";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { OrganizationPolicy } from '@/types/policy';
import { OrganizationPolicyService } from '@/lib/services/organization-policy';

interface PolicySidebarState {
  policies: OrganizationPolicy[];
  isLoading: boolean;
  error: string | null;
}

const statusColors = {
  draft: "bg-[#8a63d2] text-white",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

export function PolicySidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [showTeamInvite, setShowTeamInvite] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { currentOrganization, organizations, setCurrentOrganization } = useOrganization();
  const currentOrgId = currentOrganization?.id || '';

  // Policy state
  const [policies, setPolicies] = useState<OrganizationPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load policies when organization changes
  useEffect(() => {
    const loadPolicies = async () => {
      if (!currentOrganization) {
        setPolicies([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const orgPolicies = await OrganizationPolicyService.getByOrganization(currentOrgId);
        setPolicies(orgPolicies);
      } catch (err) {
        console.error('Error loading policies:', err);
        setError('Failed to load policies');
        toast.error('Failed to load policies');
      } finally {
        setIsLoading(false);
      }
    };

    loadPolicies();
  }, [currentOrgId]);

  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <CreatePolicyModal 
        open={showPolicyModal}
        onOpenChange={setShowPolicyModal}
        onSuccess={() => {
          setShowPolicyModal(false);
          // TODO: Refresh policies list
        }}
      />
      <TeamInviteDialog
        open={showTeamInvite}
        onOpenChange={setShowTeamInvite}
      />
      <Sidebar className="border-r border-border/40">
        <SidebarContent>
          <div className="p-4 border-b border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#8a63d2] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <h1 className="font-semibold text-lg">PolicyFlow</h1>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs text-[#8a63d2] hover:text-[#7a53c2]">
                        <Building2 className="w-3 h-3 mr-1" />
                        {currentOrganization?.name || 'Select Organization'}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <div className="space-y-1">
                        <DropdownMenuLabel className="text-[#8a63d2]">Organizations</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {organizations.map((org) => (
                          <DropdownMenuItem 
                            key={org.id}
                            className={cn(
                              "hover:bg-[#8a63d2]/10 hover:text-[#8a63d2] cursor-pointer",
                              currentOrganization?.id === org.id && "bg-[#8a63d2]/10 text-[#8a63d2]"
                            )}
                            onClick={() => setCurrentOrganization(org)}
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            {org.name}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="hover:bg-[#8a63d2]/10 hover:text-[#8a63d2] cursor-pointer"
                          onClick={() => {
                            // TODO: Implement organization creation
                            toast.error("Organization creation coming soon!");
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Organization
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <>
                <Button
                  size="default"
                  onClick={() => setShowPolicyModal(true)}
                  className="w-full bg-[#8a63d2] hover:bg-[#7a53c2] text-white flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Create New Policy
                </Button>

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search policies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 focus-visible:ring-[#8a63d2]"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTeamInvite(true)}
                    className="w-full hover:bg-muted flex items-center justify-center gap-2 border-[#8a63d2] text-[#8a63d2] hover:text-[#7a53c2]"
                  >
                    <Users className="w-4 h-4" />
                    Manage Team
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="px-4 pt-6">
            {!isCollapsed && (
              <h3 className="text-xs font-medium text-[#8a63d2] uppercase tracking-wider mb-3">
                Recent Policies
              </h3>
            )}
            <SidebarMenu>
              {filteredPolicies.map((policy) => {
                const isSelected = selectedPolicy === policy.id;
                
                return (
                  <SidebarMenuItem key={policy.id}>
                    <SidebarMenuButton
                      onClick={() => setSelectedPolicy(policy.id)}
                      className={cn(
                        "w-full justify-start p-3 rounded-lg transition-all duration-200",
                        isSelected 
                          ? "bg-[#8a63d2]/10 text-[#8a63d2] border border-[#8a63d2]/20 shadow-sm" 
                          : "hover:bg-[#8a63d2]/5 hover:text-[#8a63d2] hover:shadow-sm"
                      )}
                    >
                      <FileText className={cn("w-4 h-4", isCollapsed ? "" : "mr-3")} />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium truncate">{policy.title}</p>
                            <Badge variant="secondary" className={cn("text-xs", statusColors[policy.status])}>
                              {policy.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(policy.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </SidebarContent>
      </Sidebar>

      <TeamInviteDialog 
        open={showTeamInvite} 
        onOpenChange={setShowTeamInvite} 
      />
    </>
  );
}
