import { supabaseServiceRole } from '../../../lib/supabaseService';
import type { Database } from '@/types/supabase';
import UserCard from './UserCard';

type User = Database['public']['Tables']['s42_users']['Row'] & {
  user_groups?: {
    role: string;
    group?: { name: string } | null;
  }[];
};

export default async function UserManagementPage() {
  const supabase = supabaseServiceRole();

  // Get all users with their groups
  const { data: users, error } = await supabase
    .from('s42_users')
    .select(`
      *,
      user_groups:s42_user_groups(
        role,
        group:s42_groups(name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load users:', error);
  }

  const userList = users || [];

  async function updateUser(userId: string, updates: Partial<User>) {
    'use server';

    const supabase = supabaseServiceRole();
    const { error } = await supabase
      .from('s42_users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-3xl font-semibold'>User Management</h1>
        <p className='mt-2 text-sm text-zinc-400'>
          Manage users, view profiles, and control group memberships.
        </p>
      </header>

      <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
        <h2 className='text-xl font-medium mb-4'>All Users ({userList.length})</h2>

        {userList.length === 0 ? (
          <p className='text-zinc-400'>No users found.</p>
        ) : (
          <div className='space-y-4'>
            {userList.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onUpdate={updateUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}