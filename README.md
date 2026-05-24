# Grader Samsen

**Live site:** [https://salmonA001.github.io/grader-samsen/](https://salmonA001.github.io/grader-samsen/)

Online judge for Samsen School — classrooms, contests, and coding practice. UI inspired by Linear, Vercel, and Notion.

## Stack

- **Front-end:** React 19 + Vite + Tailwind CSS v4
- **Backend:** Express + Supabase Auth
- **Auth:** Username + password (stored in Supabase via internal email mapping)
- **Zustand** — auth, theme, code drafts (persisted)
- **Monaco Editor** — code submission
- **Mock judge** — replace with Judge0 or Docker sandbox

## Project structure

```
front-end/          React app (Vite)
backend/            Express API + Supabase integration
  src/routes/       Auth endpoints
  supabase/         SQL migrations
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `backend/supabase/migrations/001_profiles.sql`
3. Copy your project URL, anon key, and service role key

### 2. Environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5173
```

**Front-end** — copy `front-end/.env.example` to `front-end/.env` (optional for local dev; Vite proxies `/api` to the backend):

```env
VITE_API_URL=
```

Leave `VITE_API_URL` empty in development to use the Vite proxy. Set it to your backend URL in production.

### 3. Install and run

```bash
npm run install:all
npm run dev
```

- Front-end: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001](http://localhost:3001)

Or run separately:

```bash
npm run dev:front
npm run dev:back
```

## Auth

Register and sign in with **username** and **password** only. Usernames must be 3–20 characters (letters, numbers, underscores). The backend maps each username to a Supabase Auth account internally.

## Routes

- **Landing:** `/`
- **Register:** `/register`
- **Sign in:** `/login`
- **Student dashboard:** `/app`
- **Teacher admin:** `/admin` (set `role` to `teacher` in Supabase `profiles` table)

## Features (UI + mock data)

**Students:** classes, problems, Monaco submit, verdict/testcases, submissions, leaderboard, contest timer, profile/XP, dark mode.

**Teachers:** problem/testcase managers, user import/export, contest creator, analytics.

## Next steps

1. **Judge:** `front-end/src/services/judge.ts` → Judge0 API or Express + Redis queue + Docker workers
2. **Realtime:** WebSocket for leaderboard/contest updates
3. **Deploy:** Front-end to GitHub Pages / Vercel; backend to Railway, Render, or Fly.io
