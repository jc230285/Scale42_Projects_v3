# User Selection & Task Assignments - Implementation Summary

## What Was Done

### 1. Database Schema Changes
Created SQL migration: `sql/fix_task_user_relationships.sql`

**Changes:**
- Dropped old foreign keys from `s42_tasks` referencing `auth.users`
- Added new foreign key for `lead_id` → `s42_users(id)` (one-to-many)
- Created `s42_task_assignees` junction table for many-to-many assignees:
  - Columns: `task_id`, `user_id` (composite primary key)
  - Foreign keys with CASCADE delete
  - Indexes on both columns for performance
- Migrated existing `assignee_id` data to junction table
- Dropped old `assignee_id` column
- Added RLS policies for service_role and authenticated users

### 2. User Selector Component
Created: `components/UserSelectorModal.tsx`

**Features:**
- Search functionality (by name or email)
- Single or multiple selection modes
- Avatar display (with fallback initials)
- Shows selected count
- Clear all button for multiple selection
- Responsive design with dark theme

**Exported:** Added to `components/index.ts`

### 3. API Endpoints

#### Users API
Created: `app/api/users/route.ts`
- GET endpoint to fetch all `s42_users`
- Optional search query parameter
- Returns: `id`, `email`, `display_name`, `avatar_url`

#### Task Assignees API
Created: `app/api/tasks/[id]/assignees/route.ts`
- **GET**: Fetch assignees for a task
- **POST**: Add multiple assignees (accepts `user_ids` array)
- **DELETE**: Remove single assignee (query param: `user_id`)

### 4. Tasks API Update
Modified: `app/api/tasks/route.ts`
- Updated select query to include:
  - `lead:s42_users!lead_id(id,email,display_name,avatar_url)`
  - `assignees:s42_task_assignees(user:s42_users(id,email,display_name,avatar_url))`
- Removed `assignee_id` and `fel_stage` from query

### 5. Projects Page Updates
Modified: `app/(app)/projects/page.tsx`

**Interface Changes:**
- Updated `Task` interface:
  - Removed: `assignee_id`, `fel_stage`
  - Added: `lead` object, `assignees` array

**State Management:**
- Added user selector modal state:
  - `userSelectorOpen` - modal visibility
  - `userSelectorMode` - 'lead' or 'assignees'
  - `selectedTaskForUsers` - current task being edited

**Data Fetching:**
- Updated `fetchTasks()` to transform assignees from junction table format

**Columns:**
- Replaced `assignee_id` column with:
  - **Lead** column: Shows user avatar/name, click to assign
  - **Assignees** column: Shows avatar stack (up to 3), click to manage
- Both columns open `UserSelectorModal` on click

**Handlers:**
- `handleUserSelection()`: Updates lead or assignees via API
  - For lead: Single user update to `lead_id`
  - For assignees: Compares current vs new, calls add/remove APIs

## What Needs to Be Done Next

### ⚠️ CRITICAL: Run SQL Migrations in Supabase

**You MUST execute these SQL files in your Supabase SQL Editor:**

1. **First:** `sql/drop_fel_stage_column.sql`
   ```sql
   ALTER TABLE public.s42_tasks DROP COLUMN IF EXISTS fel_stage;
   ```

2. **Second:** `sql/fix_task_user_relationships.sql`
   - This file has 70+ lines
   - Creates the junction table
   - Migrates data
   - Sets up RLS policies

**⚠️ Important:** Run these migrations in order! The code will not work until these are executed.

### Testing Checklist

After running migrations:

1. ✅ Verify tasks load without errors
2. ✅ Click on Lead column - should open user selector (single mode)
3. ✅ Select a user as lead - should update and refresh
4. ✅ Click on Assignees column - should open user selector (multiple mode)
5. ✅ Select multiple assignees - should update and show avatar stack
6. ✅ Search for users by name/email in the modal
7. ✅ Clear all assignees - should show "No assignees"
8. ✅ Remove a lead - should show "Unassigned"

### Potential Issues & Solutions

**Issue:** Tasks fail to load after migration
- **Check:** Supabase logs for query errors
- **Solution:** Verify RLS policies are created correctly

**Issue:** User selector shows "Failed to load users"
- **Check:** `/api/users` endpoint returns 200
- **Solution:** Verify `s42_users` table has data and RLS allows reads

**Issue:** Assignees not updating
- **Check:** Network tab for `/api/tasks/[id]/assignees` responses
- **Solution:** Verify junction table exists and RLS allows inserts/deletes

**Issue:** Avatar images not showing
- **Check:** `avatar_url` values in `s42_users` table
- **Solution:** Fallback initials should display automatically

## Files Changed

### Created Files
- `components/UserSelectorModal.tsx` - User selection modal component
- `app/api/users/route.ts` - Users API endpoint
- `app/api/tasks/[id]/assignees/route.ts` - Task assignees API
- `sql/fix_task_user_relationships.sql` - Database migration

### Modified Files
- `components/index.ts` - Exported UserSelectorModal
- `app/api/tasks/route.ts` - Updated query to include lead/assignees
- `app/(app)/projects/page.tsx` - Complete UI integration

## Architecture Notes

### Many-to-Many Pattern
The junction table pattern used for assignees is a standard relational database approach:
- `s42_tasks` (1) ←→ (N) `s42_task_assignees` (N) ←→ (1) `s42_users`
- Allows a task to have multiple assignees
- Allows a user to be assigned to multiple tasks
- Clean deletion with CASCADE foreign keys

### One-to-Many Pattern
The lead relationship is simpler:
- `s42_tasks.lead_id` directly references `s42_users.id`
- Each task has at most one lead
- A user can be lead of multiple tasks

### API Design
- GET returns nested user objects for easy display
- POST accepts array of user IDs for batch operations
- DELETE uses query param for single removal (REST compliant)

## Next Steps After Migration

Once migrations are complete and testing passes:

1. Consider adding notifications when assigned
2. Add filtering by lead/assignee in task table
3. Add user management page to create/edit `s42_users`
4. Add user profile pictures upload
5. Consider activity log for assignment changes
