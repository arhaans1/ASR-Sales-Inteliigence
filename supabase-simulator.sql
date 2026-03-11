-- ============================================================
-- BUSINESS PROFITABILITY SIMULATOR - DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- Supports: Call Booking, Free/Paid Webinar Direct Sales, Free/Paid Webinar to Call
-- ============================================================

-- 1. Drop old tables from the previous Prospect Tracker app
DROP TABLE IF EXISTS prospect_notes CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- 2. Create clients table with multi-funnel support
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',

  -- Funnel Type (determines which fields are used)
  -- Options: 'call_booking', 'free_webinar_direct', 'paid_webinar_direct', 'free_webinar_call', 'paid_webinar_call'
  funnel_type TEXT NOT NULL DEFAULT 'call_booking',

  -- ═══════════════════════════════════════════════════════════
  -- COMMON FIELDS (used by all funnels)
  -- ═══════════════════════════════════════════════════════════
  fixed_monthly_expense     NUMERIC DEFAULT 100000,
  avg_sale_value            NUMERIC DEFAULT 50000,
  team_commission_pct       NUMERIC DEFAULT 10,
  gst_on_ad_spend_pct       NUMERIC DEFAULT 18,
  desired_monthly_profit    NUMERIC DEFAULT 200000,

  -- ═══════════════════════════════════════════════════════════
  -- CALL BOOKING FUNNEL FIELDS
  -- ═══════════════════════════════════════════════════════════
  cost_per_qualified_call   NUMERIC DEFAULT 500,
  calls_to_close            NUMERIC DEFAULT 5,
  num_closers               INTEGER DEFAULT 2,
  max_calls_per_closer_per_day INTEGER DEFAULT 8,
  simulate_ad_cost_increase BOOLEAN DEFAULT FALSE,

  -- ═══════════════════════════════════════════════════════════
  -- WEBINAR FUNNEL FIELDS (used by all webinar types)
  -- ═══════════════════════════════════════════════════════════
  cost_per_registration     NUMERIC DEFAULT 200,
  webinar_ticket_price      NUMERIC DEFAULT 0,        -- 0 for free webinars
  registration_to_attendee_pct NUMERIC DEFAULT 40,    -- % of registrations who attend

  -- For Direct Sales Webinars
  attendee_to_sale_pct      NUMERIC DEFAULT 5,        -- % of attendees who buy on webinar

  -- For Webinar to Call Funnels
  attendee_to_call_pct      NUMERIC DEFAULT 15,       -- % of attendees who book a call
  call_show_up_pct          NUMERIC DEFAULT 70,       -- % of booked calls that show up
  calls_to_close_webinar    NUMERIC DEFAULT 3,        -- calls needed to close 1 sale (usually lower than cold calls)
  cost_per_call_webinar     NUMERIC DEFAULT 0,        -- additional cost per call (optional)

  -- Team capacity for webinar-to-call funnels
  num_closers_webinar       INTEGER DEFAULT 2,
  max_calls_per_closer_webinar INTEGER DEFAULT 6,

  -- ═══════════════════════════════════════════════════════════
  -- REVERSE CALCULATION MODE
  -- ═══════════════════════════════════════════════════════════
  reverse_calculate         BOOLEAN DEFAULT FALSE,    -- if TRUE, calculate inputs from desired profit

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

-- 5. RLS Policies
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
CREATE INDEX IF NOT EXISTS idx_clients_funnel_type ON clients(funnel_type);

-- ============================================================
-- FUNNEL TYPE REFERENCE
-- ============================================================
-- 1. call_booking          - Direct call booking ads
-- 2. free_webinar_direct   - Free webinar -> direct sale on webinar
-- 3. paid_webinar_direct   - Paid webinar -> direct sale on webinar
-- 4. free_webinar_call     - Free webinar -> book call -> sale
-- 5. paid_webinar_call     - Paid webinar -> book call -> sale
-- ============================================================
