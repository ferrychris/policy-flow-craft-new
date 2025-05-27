import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrganization } from '@/hooks/use-organization';
import { Building } from 'lucide-react';

export function OrganizationSwitcher() {
  const { organizations, currentOrg, switchOrganization, isLoading } = useOrganization();

  if (isLoading || !organizations || organizations.length === 0) {
    return null;
  }

  return (
    <Select
      value={currentOrg?.id}
      onValueChange={(orgId) => switchOrganization.mutate(orgId)}
    >
      <SelectTrigger className="w-[200px]">
        <Building className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
