# JanSetu AI

JanSetu is a citizen-first guide to Indian government schemes and public services. The app runs as a Next.js application with a server-only Gemini integration boundary and a Supabase schema ready for production persistence.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

`GEMINI_API_KEY` enables the conversational assistant. The public directories work without it and link to official portals. `supabase/migrations/001_jansetu_schema.sql` contains the database tables, indexes and row-level security policies for Supabase.

## Important product boundary

JanSetu provides guidance and manual application tracking. It does not issue certificates, make eligibility decisions, or claim automatic live government status. Always verify deadlines, fees and requirements on the linked official portal.
