# S42 Boilerplate Starter

A dark-mode Next.js + Supabase starter implementing:
- Left nav with 3 states (mobile slide-in, minimized, full)
- Page management scaffold (gated by groups)
- Group-based RBAC (domain auto-groups via onAuthSignup edge function)
- Tasks module with Projects, templated Tasks, checklist, comments
- Toasts, tooltips, unified logs
- All tables prefixed with `s42_`

## Quick Start

### 1) Prerequisites
- Node 20+
- Docker (optional, for container run)
- A Supabase project (URL + anon/service keys)
- Enable **Google** provider in Supabase Auth (use your OAuth Client ID/Secret)

### 2) Configure env
Copy `.env.example` to `.env.local` (for local dev) or `.env` (for Docker) and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3) Apply SQL (migrations)
Open **Supabase SQL Editor** and run `sql/001_s42_schema.sql`.
Then run `sql/002_s42_rls_policies.sql`.
Optionally deploy edge function code under `edge-functions/onAuthSignup` using the Supabase CLI.

### 4) Run locally
```bash
npm install
npm run dev
# or with Docker:
docker compose up --build
```
Visit http://localhost:3000

### 5) Try it
- Sign in with Google
- Create a project on `/dashboard/tasks`
- Watch tasks auto-generate from the default template
- Toggle nav states from the top-left menu control

> This starter is intentionally minimal; extend it as needed.
