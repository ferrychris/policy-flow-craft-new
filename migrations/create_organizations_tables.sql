-- Create the organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create the organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'invited',
  CONSTRAINT organization_members_email_user_constraint CHECK (
    (user_id IS NOT NULL AND invited_email IS NULL) OR
    (user_id IS NULL AND invited_email IS NOT NULL)
  )
);

-- Create the organization_teams table to link teams to organizations
CREATE TABLE IF NOT EXISTS public.organization_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.team_profiles(id) ON DELETE CASCADE,
  UNIQUE(organization_id, team_id)
);

-- Create the organization_policies table to link policies to organizations
CREATE TABLE IF NOT EXISTS public.organization_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  UNIQUE(organization_id, policy_id)
);

-- Create RLS policies for organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can create organizations" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization owners and members can view their organizations" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization owners can update their organizations" ON public.organizations
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization owners can delete their organizations" ON public.organizations
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Create RLS policies for organization_members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can manage organization members" ON public.organization_members
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view their own organization" ON public.organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

-- Create RLS policies for organization_teams
ALTER TABLE public.organization_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can manage organization teams" ON public.organization_teams
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view organization teams" ON public.organization_teams
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create RLS policies for organization_policies
ALTER TABLE public.organization_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners can manage organization policies" ON public.organization_policies
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can view organization policies" ON public.organization_policies
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create indexes for better performance
CREATE INDEX organizations_owner_id_idx ON public.organizations (owner_id);
CREATE INDEX organization_members_organization_id_idx ON public.organization_members (organization_id);
CREATE INDEX organization_members_user_id_idx ON public.organization_members (user_id);
CREATE INDEX organization_members_invited_email_idx ON public.organization_members (invited_email);
CREATE INDEX organization_teams_organization_id_idx ON public.organization_teams (organization_id);
CREATE INDEX organization_teams_team_id_idx ON public.organization_teams (team_id);
CREATE INDEX organization_policies_organization_id_idx ON public.organization_policies (organization_id);
CREATE INDEX organization_policies_policy_id_idx ON public.organization_policies (policy_id);
