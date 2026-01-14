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

-- 3. Create policies for user_profiles
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Superadmins can read all profiles
CREATE POLICY "Superadmins can read all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );

-- 4. Create a function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(checking_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = checking_user_id AND is_superadmin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update prospects policies (drop old, create new)
DROP POLICY IF EXISTS "Users can manage own prospects" ON prospects;

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

-- 6. Update prospect_notes policies (drop old, create new)
DROP POLICY IF EXISTS "Users can manage own notes" ON prospect_notes;

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

-- 7. Create index for faster superadmin lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_superadmin ON user_profiles(is_superadmin) WHERE is_superadmin = TRUE;

-- 8. Function to auto-create profile on signup (optional trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, is_superadmin)
  VALUES (NEW.id, NEW.email, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- TO MAKE A USER SUPERADMIN:
-- Run this query, replacing the email:
--
-- UPDATE user_profiles
-- SET is_superadmin = TRUE
-- WHERE email = 'your-admin-email@example.com';
-- =============================================
