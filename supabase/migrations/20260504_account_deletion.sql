-- Add deletion_requested_at column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ DEFAULT NULL;

-- Index for admin queries to find accounts pending deletion
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_requested
  ON profiles (deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL;
