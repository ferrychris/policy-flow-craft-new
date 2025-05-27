-- Create a function to get organization policies by organization ID with proper type handling
CREATE OR REPLACE FUNCTION get_organization_policies_by_org_id(org_id UUID)
RETURNS SETOF organization_policies
LANGUAGE sql
AS $$
  SELECT *
  FROM organization_policies
  WHERE organization_id::text = org_id::text
  ORDER BY assigned_at DESC;
$$;
