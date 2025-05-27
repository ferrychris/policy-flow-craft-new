export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: Date;
  description?: string;
  logo_url?: string;
}

export interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  organizations: Organization[];
  loadOrganizations: () => Promise<void>;
}
