import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import SideNav from '@/components/SideNav';
import { getNavigationSections } from '@/lib/navigation';
import { authOptions } from '@/lib/auth';
import { supabaseServiceRole } from '@/lib/supabaseService';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Get navigation sections (will be filtered if user has session)
  const sections = await getNavigationSections(session);

  // Try to load dashboard page content from database
  const supabase = supabaseServiceRole();
  const { data: dashboardPage } = await supabase
    .from('s42_pages')
    .select('*')
    .eq('slug', 'dashboard')
    .single();

  // Check if user has access to dashboard page
  let hasDashboardAccess = true; // Default to true for public access
  if (dashboardPage && session?.user?.email) {
    // Check if dashboard has group restrictions
    const { data: pageGroups } = await supabase
      .from('s42_page_groups')
      .select('group_id')
      .eq('page_id', dashboardPage.id);

    if (pageGroups && pageGroups.length > 0) {
      // Dashboard has group restrictions, check user membership
      const { data: user } = await supabase
        .from('s42_users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (user) {
        const { data: userGroups } = await supabase
          .from('s42_user_groups')
          .select('group_id')
          .eq('user_id', user.id);

        const userGroupIds = userGroups?.map(ug => ug.group_id) || [];
        hasDashboardAccess = pageGroups.some(pg => userGroupIds.includes(pg.group_id));
      } else {
        hasDashboardAccess = false;
      }
    }
  }

  return (
    <div className='flex min-h-screen bg-zinc-950 text-zinc-100'>
      <SideNav sections={sections} />
      <main className='flex-1 overflow-y-auto'>
        <div className='max-w-5xl mx-auto w-full p-6'>
          {dashboardPage && hasDashboardAccess ? (
            <div className='space-y-6'>
              <header>
                <h1 className='text-3xl font-semibold'>{dashboardPage.title}</h1>
              </header>
              <div className='prose prose-invert max-w-none'>
                {/* For now, just show the content as plain text. Could add MDX rendering later */}
                <div className='whitespace-pre-wrap text-zinc-300'>
                  {dashboardPage.content_mdx}
                </div>
              </div>
            </div>
          ) : !session ? (
            <div className='space-y-6'>
              <header>
                <h1 className='text-3xl font-semibold'>Welcome to S42</h1>
                <p className='mt-2 text-sm text-zinc-400'>
                  A boilerplate for project management with group-based access, templated tasks, and dynamic pages.
                </p>
                <div className='mt-6'>
                  <a
                    href='/login'
                    className='inline-block bg-zinc-100 text-zinc-900 px-6 py-3 rounded-lg hover:bg-white transition-colors font-medium'
                  >
                    Sign In
                  </a>
                </div>
              </header>
            </div>
          ) : (
            <div className='space-y-6'>
              <header>
                <h1 className='text-3xl font-semibold'>Welcome to S42</h1>
                <p className='mt-2 text-sm text-zinc-400'>
                  A boilerplate for project management with group-based access, templated tasks, and dynamic pages.
                </p>
              </header>
              <section className='grid gap-3 md:grid-cols-2'>
                <a
                  href='/projects'
                  className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-colors'
                >
                  <h2 className='text-lg font-medium text-zinc-100'>Projects</h2>
                  <p className='mt-1 text-sm text-zinc-400'>
                    Spin up initiatives from templates, populate checklists, and monitor execution.
                  </p>
                </a>
                <a
                  href='/pages'
                  className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-colors'
                >
                  <h2 className='text-lg font-medium text-zinc-100'>Pages Directory</h2>
                  <p className='mt-1 text-sm text-zinc-400'>
                    Browse dynamic pages available to you based on group membership.
                  </p>
                </a>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}