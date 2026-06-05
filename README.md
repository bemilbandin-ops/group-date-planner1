# Group Date Planner

A simple shared scheduling site for friends/family to quickly agree on a date without messy chat threads.

## Features

- **Create Events**: Quickly create events with title, description, and initial date suggestion
- **Shareable Links**: Each event gets a unique URL to share with participants
- **Date Suggestions**: Participants can suggest new dates and times
- **Voting System**: Vote Yes/No/Maybe on date suggestions
- **Visual Breakdown**: See who voted what for each date
- **Smart Sorting**: Dates automatically sorted by most Yes votes, fewest No votes

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL database)
- **Deployment**: Vercel (frontend) + Supabase (backend)

## Setup Instructions

### 1. Prerequisites

- Node.js installed
- Supabase account (free tier works)

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor and run the SQL from `supabase-schema.sql`:

```sql
-- Events Table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Date Suggestions Table
CREATE TABLE date_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME,
  suggested_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes Table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id UUID REFERENCES date_suggestions(id) ON DELETE CASCADE NOT NULL,
  voter_name TEXT NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('yes', 'no', 'maybe')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(suggestion_id, voter_name)
);

-- Enable Row Level Security (allowing all operations since we don't have auth)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (no auth required)
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on date_suggestions" ON date_suggestions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on votes" ON votes FOR ALL USING (true) WITH CHECK (true);
```

3. Get your Supabase URL and Anon Key from Project Settings > API
4. Create `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Create Event" on the homepage
2. Fill in event details and your name
3. Share the generated event URL with friends/family
4. Participants can vote on suggested dates and add new suggestions
5. The best date rises to the top automatically!

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx        # Create event page
│   └── event/[id]/page.tsx   # Event details page
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── CopyLinkButton.tsx    # Client-side copy button
└── lib/
    └── supabase.ts            # Supabase client
```

## Design

- Dark mode only (charcoal/near-black background)
- Accent color: Teal (#2dd4bf)
- Inspired by Discord + Notion + Linear
- Mobile-first responsive design

## License

MIT