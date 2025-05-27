-- First, drop any existing foreign key constraints
ALTER TABLE IF EXISTS organization_policies DROP CONSTRAINT IF EXISTS organization_policies_organization_id_fkey;

-- Change the organization_id column type from integer to uuid
ALTER TABLE organization_policies 
  ALTER COLUMN organization_id TYPE uuid USING organization_id::uuid;

-- Add the foreign key constraint back
ALTER TABLE organization_policies 
  ADD CONSTRAINT organization_policies_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Ensure the policy_id column is uuid
ALTER TABLE IF EXISTS organization_policies 
  ALTER COLUMN policy_id TYPE uuid USING policy_id::uuid;

-- Add foreign key constraint for policy_id if it doesn't exist
ALTER TABLE IF EXISTS organization_policies 
  ADD CONSTRAINT organization_policies_policy_id_fkey 
  FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL;

-- Ensure created_by column is uuid
ALTER TABLE IF EXISTS organization_policies 
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid;

-- Add foreign key constraint for created_by if it doesn't exist
ALTER TABLE IF EXISTS organization_policies 
  ADD CONSTRAINT organization_policies_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index on organization_id for better query performance
CREATE INDEX IF NOT EXISTS idx_organization_policies_organization_id 
  ON organization_policies(organization_id);

-- Create index on policy_id for better query performance
CREATE INDEX IF NOT EXISTS idx_organization_policies_policy_id 
  ON organization_policies(policy_id);
