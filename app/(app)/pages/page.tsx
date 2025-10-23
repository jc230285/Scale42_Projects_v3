import { getServerSession } from 'next-auth';
import { supabaseServiceRole } from '../../../lib/supabaseService';
import { authOptions } from '../../../lib/auth';
import PageManagement from './PageManagement';

export default async function PagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className='space-y-6'>
        <header>
          <h1 className='text-3xl font-semibold'>Access Denied</h1>
          <p className='mt-2 text-sm text-zinc-400'>
            You must be logged in to view this page.
          </p>
        </header>
      </div>
    );
  }

  const supabase = supabaseServiceRole();

  // Get user ID from email
  const { data: user } = await supabase
    .from('s42_users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!user) {
    return (
      <div className='space-y-6'>
        <header>
          <h1 className='text-3xl font-semibold'>User Not Found</h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Your user account was not found in the system.
          </p>
        </header>
      </div>
    );
  }

  // Get user's groups
  const { data: userGroups } = await supabase
    .from('s42_user_groups')
    .select('group_id')
    .eq('user_id', user.id);

  const groupIds = userGroups?.map(ug => ug.group_id) || [];

  // Get all pages
  let pages: any[] = [];
  let error: any = null;

  try {
    // First, get all pages
    const { data: allPages, error: pagesError } = await supabase
      .from('s42_pages')
      .select('*');

    if (pagesError) {
      throw pagesError;
    }

    // Get menu items to determine sort order
    const { data: menuItems, error: menuError } = await supabase
      .from('s42_menu_items')
      .select('page_id, sort_order')
      .not('page_id', 'is', null);

    if (menuError) {
      throw menuError;
    }

    // Sort pages by menu item sort_order, with fallback to created_at
    const sortedPages = allPages?.sort((a, b) => {
      const aMenuItem = menuItems?.find(mi => mi.page_id === a.id);
      const bMenuItem = menuItems?.find(mi => mi.page_id === b.id);

      const aSort = aMenuItem?.sort_order ?? 999;
      const bSort = bMenuItem?.sort_order ?? 999;

      if (aSort !== bSort) {
        return aSort - bSort;
      }

      // Fallback to created_at if sort_order is the same
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }) || [];

    // Then get page-group relationships
    const { data: pageGroupRelations, error: pgError } = await supabase
      .from('s42_page_groups')
      .select('page_id, group_id');

    if (pgError) {
      throw pgError;
    }

    // Combine the data
    pages = sortedPages?.map(page => {
      const pageGroups = pageGroupRelations?.filter(pg => pg.page_id === page.id) || [];
      return {
        ...page,
        group_ids: pageGroups.map(pg => pg.group_id)
      };
    }) || [];

    // Filter pages based on group access
    // Public pages (no group restrictions) are visible to everyone
    // Restricted pages only show if user is in the required groups
    pages = pages.filter(page => {
      // If page has no group restrictions, allow access to everyone
      if (!page.group_ids || page.group_ids.length === 0) {
        return true;
      }
      // If page has group restrictions, check if user is in any of those groups
      return groupIds.length > 0 && page.group_ids.some((gid: string) => groupIds.includes(gid));
    });
  } catch (err) {
    error = err;
  }

  // Get categories for the dropdown
  const { data: categories } = await supabase
    .from('s42_categories')
    .select('id, name')
    .order('name');

  // Get all groups for the form
  const { data: allGroups } = await supabase
    .from('s42_groups')
    .select('id, name')
    .order('name');

  if (error) {
    console.error('Error fetching pages:', error);
    return (
      <div className='space-y-6'>
        <header>
          <h1 className='text-3xl font-semibold'>Page Management</h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Error loading pages: {error.message || 'Unknown error'}
          </p>
        </header>
      </div>
    );
  }

  return (
    <PageManagement
      pages={pages}
      categories={categories || []}
      allGroups={allGroups || []}
    />
  );
}