-- 004_seed_navigation.sql
-- Seed base categories, pages, and menu items used by the dashboard navigation.

insert into public.s42_categories (name, sort_order)
select 'General', 0
where not exists (select 1 from public.s42_categories where name = 'General');

insert into public.s42_categories (name, sort_order)
select 'Management', 1
where not exists (select 1 from public.s42_categories where name = 'Management');

insert into public.s42_categories (name, sort_order)
select 'Resources', 2
where not exists (select 1 from public.s42_categories where name = 'Resources');

-- Ensure base pages exist or are updated
update public.s42_pages
set title = 'User Management',
    content_mdx = 'Manage users, view profiles, and control group memberships.'
where slug = 'users';

update public.s42_pages
set title = 'Group Management',
    content_mdx = 'Control group assignments, domain mappings, and permissions.'
where slug = 'groups';

insert into public.s42_pages (title, slug, category_id, content_mdx)
select
  'User Management',
  'users',
  (select id from public.s42_categories where name = 'Management'),
  'Manage users, view profiles, and control group memberships.'
where not exists (select 1 from public.s42_pages where slug = 'users');

insert into public.s42_pages (title, slug, category_id, content_mdx)
select
  'Group Management',
  'groups',
  (select id from public.s42_categories where name = 'Management'),
  'Control group assignments, domain mappings, and permissions.'
where not exists (select 1 from public.s42_pages where slug = 'groups');

insert into public.s42_pages (title, slug, category_id, content_mdx)
select
  'Page Management',
  'page-management',
  (select id from public.s42_categories where name = 'Management'),
  'Create, edit, and organise pages and menu items. Attach groups to control visibility.'
where not exists (select 1 from public.s42_pages where slug = 'page-management');

insert into public.s42_pages (title, slug, category_id, content_mdx)
select
  'Project Management',
  'project-management',
  (select id from public.s42_categories where name = 'Management'),
  'Oversee active projects, task templates, checklists, and FEL tracking.'
where not exists (select 1 from public.s42_pages where slug = 'project-management');

insert into public.s42_pages (title, slug, category_id, content_mdx)
select
  'Dashboard Overview',
  'dashboard',
  (select id from public.s42_categories where name = 'General'),
  'High-level snapshot of projects, navigation tips, and quick links.'
where not exists (select 1 from public.s42_pages where slug = 'dashboard');

insert into public.s42_pages (title, slug, category_id, content_mdx)
select
  'Knowledge Base',
  'knowledge-base',
  (select id from public.s42_categories where name = 'Resources'),
  'Central repository for runbooks, processes, and operating manuals.'
where not exists (select 1 from public.s42_pages where slug = 'knowledge-base');

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Projects',
  'list-checks',
  'internal',
  '/projects',
  (select id from public.s42_categories where name = 'General'),
  0,
  null
where not exists (select 1 from public.s42_menu_items where href = '/projects');

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Activity Logs',
  'activity',
  'internal',
  '/logs',
  (select id from public.s42_categories where name = 'General'),
  1,
  null
where not exists (select 1 from public.s42_menu_items where href = '/logs');

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Dashboard',
  'layout-grid',
  'internal',
  '/',
  (select id from public.s42_categories where name = 'General'),
  -1,
  (select id from public.s42_pages where slug = 'dashboard')
where not exists (select 1 from public.s42_menu_items where href = '/');

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Pages',
  'file-text',
  'internal',
  '/pages',
  (select id from public.s42_categories where name = 'General'),
  1,
  null
where not exists (select 1 from public.s42_menu_items where href = '/pages');

-- Dynamic page links
update public.s42_menu_items
set label = 'User Management'
where href = '/pages/users';

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'User Management',
  'users',
  'internal',
  '/pages/users',
  (select id from public.s42_categories where name = 'Management'),
  0,
  (select id from public.s42_pages where slug = 'users')
where not exists (select 1 from public.s42_menu_items where href = '/pages/users');

update public.s42_menu_items
set label = 'Group Management'
where href = '/pages/groups';

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Group Management',
  'shield',
  'internal',
  '/pages/groups',
  (select id from public.s42_categories where name = 'Management'),
  1,
  (select id from public.s42_pages where slug = 'groups')
where not exists (select 1 from public.s42_menu_items where href = '/pages/groups');

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Page Management',
  'settings',
  'internal',
  '/pages/page-management',
  (select id from public.s42_categories where name = 'Management'),
  2,
  (select id from public.s42_pages where slug = 'page-management')
where not exists (select 1 from public.s42_menu_items where label = 'Page Management');

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Project Management',
  'clipboard-list',
  'internal',
  '/pages/project-management',
  (select id from public.s42_categories where name = 'Management'),
  3,
  (select id from public.s42_pages where slug = 'project-management')
where not exists (select 1 from public.s42_menu_items where href = '/pages/project-management');

insert into public.s42_menu_items (label, icon, href_type, href, category_id, sort_order, page_id)
select
  'Knowledge Base',
  'book',
  'internal',
  '/pages/knowledge-base',
  (select id from public.s42_categories where name = 'Resources'),
  0,
  (select id from public.s42_pages where slug = 'knowledge-base')
where not exists (select 1 from public.s42_menu_items where href = '/pages/knowledge-base');
