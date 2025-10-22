'use client';

import { useState } from 'react';
import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['s42_users']['Row'] & {
  user_groups?: {
    role: string;
    group?: { name: string } | null;
  }[];
};

interface UserCardProps {
  user: User;
  onUpdate: (userId: string, updates: Partial<User>) => Promise<void>;
}

export default function UserCard({ user, onUpdate }: UserCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(user.id, { display_name: displayName });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user.display_name || '');
    setIsEditing(false);
  };

  return (
    <div className='flex items-center justify-between p-4 rounded-lg border border-zinc-700 bg-zinc-800/50'>
      <div className='flex items-center gap-4'>
        {user.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.display_name || user.email}
            className='w-10 h-10 rounded-full'
          />
        )}
        <div>
          {isEditing ? (
            <div className='space-y-2'>
              <input
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className='px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm'
                placeholder='Display name'
              />
              <div className='flex gap-2'>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className='px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded disabled:opacity-50'
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className='px-2 py-1 bg-zinc-600 hover:bg-zinc-500 text-white text-xs rounded'
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className='font-medium text-zinc-100'>
                {user.display_name || 'No name'}
              </h3>
              <p className='text-sm text-zinc-400'>{user.email}</p>
              <p className='text-xs text-zinc-500'>
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <div className='text-right text-sm text-zinc-400'>
          {user.user_groups && user.user_groups.length > 0 ? (
            <div className='space-y-1'>
              {user.user_groups.map((ug, idx) => (
                <span key={idx} className='inline-block mr-2'>
                  {ug.group?.name} ({ug.role})
                </span>
              ))}
            </div>
          ) : (
            <span className='text-zinc-500'>No groups</span>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className='px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded'
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}