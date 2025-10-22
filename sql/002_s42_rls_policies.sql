
-- Enable RLS
alter table public.s42_groups enable row level security;
alter table public.s42_user_groups enable row level security;
alter table public.s42_pages enable row level security;
alter table public.s42_page_groups enable row level security;
alter table public.s42_menu_items enable row level security;
alter table public.s42_projects enable row level security;
alter table public.s42_project_groups enable row level security;
alter table public.s42_tasks enable row level security;
alter table public.s42_task_checklist enable row level security;
alter table public.s42_task_comments enable row level security;
alter table public.s42_logs enable row level security;

-- Groups visible to members
create policy s42_groups_select on public.s42_groups
for select using (
  exists (select 1 from public.s42_user_groups ug where ug.group_id = s42_groups.id and ug.user_id = auth.uid())
);

-- Allow admins to manage groups (assumes a group named 'Admin' or 'Superadmin' contains admin users)
create policy s42_groups_admin_ins on public.s42_groups
for insert to authenticated with check (
  exists (
    select 1 from public.s42_user_groups ug
    join public.s42_groups g on g.id = ug.group_id
    where ug.user_id = auth.uid() and g.name in ('Admin','Superadmin')
  )
);

create policy s42_groups_admin_upd on public.s42_groups
for update to authenticated using (
  exists (
    select 1 from public.s42_user_groups ug
    join public.s42_groups g on g.id = ug.group_id
    where ug.user_id = auth.uid() and g.name in ('Admin','Superadmin')
  )
);

-- user_groups: users can see their own memberships
create policy s42_user_groups_select on public.s42_user_groups
for select using (user_id = auth.uid());

-- Pages readable if user is in any attached group
create policy s42_pages_select on public.s42_pages
for select using (
  exists (
    select 1 from public.s42_page_groups pg
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where pg.page_id = s42_pages.id and ug.user_id = auth.uid()
  )
);

-- Page groups: visible if you're a member of that group
create policy s42_page_groups_select on public.s42_page_groups
for select using (
  exists (
    select 1 from public.s42_user_groups ug
    where ug.group_id = s42_page_groups.group_id and ug.user_id = auth.uid()
  )
);

-- Menu items: visible if internal page is visible
create policy s42_menu_items_select on public.s42_menu_items
for select using (
  coalesce(page_id is null, false) = false AND
  exists (
    select 1 from public.s42_pages p
    join public.s42_page_groups pg on pg.page_id = p.id
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where p.id = s42_menu_items.page_id and ug.user_id = auth.uid()
  )
  OR (page_id is null) -- external links (open by default or gate elsewhere)
);

-- Projects visible if user belongs to any of the project's groups
create policy s42_projects_select on public.s42_projects
for select using (
  exists (
    select 1 from public.s42_project_groups pg
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where pg.project_id = s42_projects.id and ug.user_id = auth.uid()
  )
);

-- Tasks visible via their project visibility
create policy s42_tasks_select on public.s42_tasks
for select using (
  exists (
    select 1 from public.s42_projects p
    join public.s42_project_groups pg on pg.project_id = p.id
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where p.id = s42_tasks.project_id and ug.user_id = auth.uid()
  )
);

-- Checklist, comments, logs: visible via project membership
create policy s42_task_checklist_select on public.s42_task_checklist
for select using (
  exists (
    select 1 from public.s42_tasks t
    join public.s42_projects p on p.id = t.project_id
    join public.s42_project_groups pg on pg.project_id = p.id
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where t.id = s42_task_checklist.task_id and ug.user_id = auth.uid()
  )
);

create policy s42_task_comments_select on public.s42_task_comments
for select using (
  exists (
    select 1 from public.s42_projects p
    join public.s42_project_groups pg on pg.project_id = p.id
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where p.id = s42_task_comments.project_id and ug.user_id = auth.uid()
  )
);

create policy s42_logs_select on public.s42_logs
for select using (true); -- read-only

-- Basic insert/update policies for members
create policy s42_tasks_ins on public.s42_tasks
for insert to authenticated with check (
  exists (
    select 1 from public.s42_project_groups pg
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where pg.project_id = s42_tasks.project_id and ug.user_id = auth.uid()
  )
);

create policy s42_task_checklist_upd on public.s42_task_checklist
for update to authenticated using (
  exists (
    select 1 from public.s42_tasks t
    join public.s42_projects p on p.id = t.project_id
    join public.s42_project_groups pg on pg.project_id = p.id
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where t.id = s42_task_checklist.task_id and ug.user_id = auth.uid()
  )
);

create policy s42_task_comments_ins on public.s42_task_comments
for insert to authenticated with check (
  exists (
    select 1 from public.s42_projects p
    join public.s42_project_groups pg on pg.project_id = p.id
    join public.s42_user_groups ug on ug.group_id = pg.group_id
    where p.id = s42_task_comments.project_id and ug.user_id = auth.uid()
  )
);
