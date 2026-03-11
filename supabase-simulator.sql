-- ============================================================
-- BUSINESS PROFITABILITY SIMULATOR - DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Drop old tables from the previous Prospect Tracker app
DROP TABLE IF EXISTS prospect_notes CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;

-- 2. Create clients table (each row = a business scenario)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',

  -- Calculator Inputs
  fixed_monthly_expense     NUMERIC DEFAULT 100000,
  cost_per_qualified_call   NUMERIC DEFAULT 500,
  calls_to_close            NUMERIC DEFAULT 5,
  avg_sale_value            NUMERIC DEFAULT 50000,
  team_commission_pct       NUMERIC DEFAULT 10,
  gst_on_ad_spend_pct       NUMERIC DEFAULT 18,
  desired_monthly_profit    NUMERIC DEFAULT 200000,
  num_closers               INTEGER DEFAULT 2,
  max_calls_per_closer_per_day INTEGER DEFAULT 8,
  simulate_ad_cost_increase BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policies (safe re-run)
DROP POLICY IF EXISTS "Admins can view own clients" ON clients;
DROP POLICY IF EXISTS "Admins can insert own clients" ON clients;
DROP POLICY IF EXISTS "Admins can update own clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete own clients" ON clients;

-- 5. RLS Policies — admins own their data; superadmins see all
CREATE POLICY "Admins can view own clients" ON clients
  FOR SELECT USING (auth.uid() = admin_id OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = admin_id OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = admin_id OR is_superadmin(auth.uid()));

CREATE POLICY "Admins can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = admin_id OR is_superadmin(auth.uid()));

-- 6. Performance index
CREATE INDEX IF NOT EXISTS idx_clients_admin_id ON clients(admin_id);

-- ============================================================
-- NOTE: Keep the user_profiles table and is_superadmin()
-- function from the previous supabase-superadmin.sql setup.
-- They are still required for authentication.
-- ============================================================
