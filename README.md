# Prospect Tracker

A React SPA for tracking sales call prospects, calculating funnel metrics, taking call notes, and projecting potential results.

## Features

- Login/Signup authentication with Supabase
- Prospect list with search and status filter
- Create/Edit prospects with funnel type selection
- 3-Tab Prospect View:
  - **Details Tab**: Current stats + auto-calculated metrics
  - **Notes Tab**: Call notes with types & timestamps
  - **Projections Tab**: What-if scenarios with scaling timeline

## Funnel Types

1. **Webinar Funnel**: Registration → Attendance → Sale
2. **Webinar-to-Call Funnel**: Registration → Attendance → Call Booking → Call Attendance → Sale
3. **Direct Call Funnel**: Opt-In → Call Booking → Call Attendance → Sale

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router DOM
- Supabase (PostgreSQL + Auth)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Project Settings > API to get your URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

Run the following SQL in Supabase SQL Editor:

```sql
-- Prospects table
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'call_scheduled', 'call_completed', 'proposal_sent', 'won', 'lost')),
  call_date TIMESTAMPTZ,

  -- Funnel Type
  funnel_type TEXT NOT NULL CHECK (funnel_type IN ('webinar', 'webinar_to_call', 'direct_call')),

  -- Stage 1: Entry
  stage1_name TEXT DEFAULT 'Registration',
  stage1_price DECIMAL DEFAULT 0,
  stage1_is_paid BOOLEAN DEFAULT FALSE,
  current_daily_spend DECIMAL,
  current_cpa_stage1 DECIMAL,

  -- Stage 2
  stage2_name TEXT DEFAULT 'Attendance',
  stage2_price DECIMAL DEFAULT 0,
  stage2_is_paid BOOLEAN DEFAULT FALSE,
  current_stage2_rate DECIMAL DEFAULT 70,

  -- Stage 3 (optional)
  stage3_enabled BOOLEAN DEFAULT FALSE,
  stage3_name TEXT,
  stage3_price DECIMAL DEFAULT 0,
  stage3_is_paid BOOLEAN DEFAULT FALSE,
  current_stage3_rate DECIMAL,

  -- Stage 4 (optional)
  stage4_enabled BOOLEAN DEFAULT FALSE,
  stage4_name TEXT,
  current_stage4_rate DECIMAL,

  -- High Ticket
  high_ticket_price DECIMAL,
  current_conversion_rate DECIMAL DEFAULT 30,

  -- Projections
  projected_daily_spend DECIMAL,
  projected_cpa_stage1 DECIMAL,
  projected_stage2_rate DECIMAL,
  projected_stage3_rate DECIMAL,
  projected_stage4_rate DECIMAL,
  projected_conversion_rate DECIMAL,
  projected_high_ticket_price DECIMAL,

  -- Campaign settings
  optimization_event TEXT,
  layer1_creatives TEXT DEFAULT '10-12',
  layer2_enabled BOOLEAN DEFAULT TRUE,
  layer2_creatives TEXT DEFAULT '18-20',
  scaling_increment_percent DECIMAL DEFAULT 20,
  scaling_frequency_days INTEGER DEFAULT 3,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE prospect_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'call_notes', 'objection', 'action_item', 'follow_up')),
  is_pinned BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own prospects" ON prospects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON prospect_notes FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_prospects_user_id ON prospects(user_id);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_notes_prospect_id ON prospect_notes(prospect_id);
```

### 4. Enable Auth

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Email provider

### 5. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/          # React context (AuthContext)
├── hooks/            # Custom hooks (useAuth, useProspects, useNotes)
├── lib/              # Utilities (supabase, calculations, formatters)
├── pages/            # Page components
├── App.jsx           # Main app with routing
└── main.jsx          # Entry point
```

## Deployment

Build for production:

```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting (Vercel, Netlify, etc.).
