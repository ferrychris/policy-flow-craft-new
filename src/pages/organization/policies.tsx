import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Clock, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreatePolicyModal } from '@/components/policy/CreatePolicyModal';
import { useOrganization } from '@/contexts/organization-context';
import { OrganizationPolicyService } from '@/lib/services/organization-policy';
import { OrganizationPolicy } from '@/types/policy';
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

const statusColors = {
  draft: "bg-[#8a63d2] text-white",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<OrganizationPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (currentOrganization) {
      loadPolicies();
    }
  }, [currentOrganization]);

  const loadPolicies = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      const policies = await OrganizationPolicyService.getByOrganization(currentOrganization.id);
      setPolicies(policies);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchivePolicy = async (policyId: string) => {
    try {
      await OrganizationPolicyService.update(policyId, { status: 'archived' });
      toast.success('Policy archived successfully');
      loadPolicies();
    } catch (error) {
      console.error('Error archiving policy:', error);
      toast.error('Failed to archive policy');
    }
  };

  const handlePublishPolicy = async (policyId: string) => {
    try {
      await OrganizationPolicyService.update(policyId, { status: 'published' });
      toast.success('Policy published successfully');
      loadPolicies();
    } catch (error) {
      console.error('Error publishing policy:', error);
      toast.error('Failed to publish policy');
    }
  };

  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organization Policies</h1>
          <p className="text-muted-foreground">
            Manage and organize your organization's policies.
          </p>
        </div>
        <Button
          onClick={() => setShowCreatePolicy(true)}
          className="bg-[#8a63d2] hover:bg-[#7a53c2]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
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
              <TableHead>Policy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPolicies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#8a63d2]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#8a63d2]" />
                    </div>
                    <div>
                      <div className="font-medium">{policy.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {policy.description || 'No description'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[policy.status]}>
                    {policy.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {new Date(policy.updated_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {policy.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handlePublishPolicy(policy.id)}
                        >
                          Publish
                        </DropdownMenuItem>
                      )}
                      {policy.status !== 'archived' && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleArchivePolicy(policy.id)}
                        >
                          Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreatePolicyModal
        open={showCreatePolicy}
        onOpenChange={setShowCreatePolicy}
        onSuccess={() => {
          setShowCreatePolicy(false);
          loadPolicies();
        }}
      />
    </div>
  );
}
