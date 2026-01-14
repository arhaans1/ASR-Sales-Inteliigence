-- =============================================
-- SUPERADMIN SETUP SQL
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  is_superadmin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Superadmins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can insert their own profile" ON user_profiles;

-- 4. Create policies for user_profiles
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can insert their own profile (for new signups)
CREATE POLICY "Anyone can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create a function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(checking_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = checking_user_id AND is_superadmin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create policy for superadmins to read all profiles
CREATE POLICY "Superadmins can read all profiles" ON user_profiles
  FOR SELECT USING (is_superadmin(auth.uid()));

-- 7. Update prospects policies (drop old, create new)
DROP POLICY IF EXISTS "Users can manage own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can view own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can insert own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can update own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can delete own prospects" ON prospects;

CREATE POLICY "Users can view own prospects" ON prospects
  FOR SELECT USING (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

CREATE POLICY "Users can insert own prospects" ON prospects
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

CREATE POLICY "Users can update own prospects" ON prospects
  FOR UPDATE USING (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

CREATE POLICY "Users can delete own prospects" ON prospects
  FOR DELETE USING (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

-- 8. Update prospect_notes policies (drop old, create new)
DROP POLICY IF EXISTS "Users can manage own notes" ON prospect_notes;
DROP POLICY IF EXISTS "Users can view own notes" ON prospect_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON prospect_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON prospect_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON prospect_notes;

CREATE POLICY "Users can view own notes" ON prospect_notes
  FOR SELECT USING (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

CREATE POLICY "Users can insert own notes" ON prospect_notes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

CREATE POLICY "Users can update own notes" ON prospect_notes
  FOR UPDATE USING (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

CREATE POLICY "Users can delete own notes" ON prospect_notes
  FOR DELETE USING (
    auth.uid() = user_id OR is_superadmin(auth.uid())
  );

-- 9. Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_superadmin ON user_profiles(is_superadmin) WHERE is_superadmin = TRUE;

-- 10. Insert profiles for ALL existing users (run this after creating the table)
INSERT INTO user_profiles (user_id, email, is_superadmin)
SELECT id, email, FALSE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- TO MAKE A USER SUPERADMIN:
-- Run this query, replacing the email:
--
-- UPDATE user_profiles
-- SET is_superadmin = TRUE
-- WHERE email = 'your-admin-email@example.com';
-- =============================================
