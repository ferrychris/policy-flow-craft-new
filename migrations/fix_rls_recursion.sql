-- Drop existing policies
DROP POLICY IF EXISTS "Organization members can view their own organization" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners and members can view their organizations" ON public.organizations;

-- Create new non-recursive policies
CREATE POLICY "Members can view their memberships" ON public.organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR  -- User can see their own memberships
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE id = organization_members.organization_id 
      AND owner_id = auth.uid()
    )  -- Organization owners can see all members
  );

CREATE POLICY "Users can view accessible organizations" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR  -- User owns the organization
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )  -- User is an active member
  );
