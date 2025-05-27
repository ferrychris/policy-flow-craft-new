-- Create organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  stripe_customer_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create user_organizations table for many-to-many relationship
CREATE TABLE user_organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, organization_id)
);

-- Create RLS policies for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users with admin role can update their organizations"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
    )
  );

-- Create RLS policies for user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their current organization"
  ON user_organizations FOR UPDATE
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX organizations_stripe_customer_id_idx ON organizations(stripe_customer_id);
CREATE INDEX user_organizations_user_id_idx ON user_organizations(user_id);
CREATE INDEX user_organizations_organization_id_idx ON user_organizations(organization_id);
CREATE INDEX user_organizations_is_current_idx ON user_organizations(is_current);

-- Create function to ensure only one current organization per user
CREATE OR REPLACE FUNCTION ensure_single_current_organization()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current THEN
    UPDATE user_organizations
    SET is_current = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain single current organization
CREATE TRIGGER ensure_single_current_organization_trigger
  BEFORE INSERT OR UPDATE ON user_organizations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_current_organization();
