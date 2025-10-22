# Project Status – S42 Boilerplate

## Current Sprint Highlights
- NextAuth Google OAuth integrated; `s42_users` table populated on sign-in with domain group auto-creation.
- All `s42_` tables created in Supabase (schema applied manually due to migration mismatches).
- RLS policies applied for group-based access control.
- App running locally on `http://localhost:3000`; login flow tested and working.
- Norway and Iceland task templates inserted into `s42_task_templates`.

## Immediate TODOs
1. **Push Cloud Schema & Seed Data** ✅ DONE
   - Schema applied manually in Supabase SQL Editor (tables created, RLS enabled).
   - Seed task templates: Norway/Iceland templates inserted.
   - Navigation/page seed pending if needed.
2. **NextAuth Google Sign-In** ✅ DONE
   - Environment vars set.
   - Redirect URL added in Google Console: `http://localhost:3000/api/auth/callback/google`.
   - Login tested; `s42_users` populated on sign-in.
3. **Smoke Test Edge Function**
   - Deploy `create_project_from_template` Edge Function.
   - Test project creation from templates (e.g., Norway/Iceland).
   - Verify inserts in `s42_projects`, `s42_tasks`, `s42_task_checklist`.
4. **Navigation Group Controls**
   - `s42_menu_item_groups` table exists; policies updated for external link gating.
   - Build page management UI for menu items and groups.

## Pending Features (Backlog)
- Comments side panel with realtime updates.
- Task board (Kanban) view.
- Logs retention scheduled function.
- Markdown rendering for task notes (with sanitisation).
- Project group selection UI when creating a project.

## Validation Checklist
- `npm run dev` → App running at `http://localhost:3000`. ✅
- Login with Google → Redirects to `/dashboard`, `s42_users` populated. ✅
- Project creation UI ready; needs Edge Function deployment for full flow.
- Tailwind assets load (`/_next/static/css/app/layout.css`). ✅
- No Supabase client errors in console. ✅

_Updated: 2025-10-12 (post auth and schema setup)_
