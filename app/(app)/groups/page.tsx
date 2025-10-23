import { getServerSession } from 'next-auth';
import { supabaseServiceRole } from '../../../lib/supabaseService';
import { authOptions } from '../../../lib/auth';
import GroupManagement from './GroupManagement';

export default async function GroupsPage() {
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

  // Get all groups
  const { data: groups, error } = await supabase
    .from('s42_groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching groups:', error);
    return (
      <div className='space-y-6'>
        <header>
          <h1 className='text-3xl font-semibold'>Group Management</h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Error loading groups: {error.message}
          </p>
        </header>
      </div>
    );
  }

  return (
    <GroupManagement groups={groups || []} />
  );
}