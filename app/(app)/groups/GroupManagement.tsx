'use client';

import { useState } from 'react';
import { createGroup, updateGroup, deleteGroup } from './actions';

type Group = {
  id: string;
  name: string;
  slug: string;
  type: string;
  domain: string | null;
  created_at: string;
};

type Props = {
  groups: Group[];
};

export default function GroupManagement({ groups }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    const result = await createGroup(formData);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setShowCreateForm(false);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingGroup) return;

    setIsSubmitting(true);
    setError(null);
    const result = await updateGroup(editingGroup.id, formData);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setEditingGroup(null);
    }
  }

  async function handleDelete(groupId: string) {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    setIsSubmitting(true);
    setError(null);
    const result = await deleteGroup(groupId);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className='space-y-6'>
      <header className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-semibold'>Group Management</h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Create, edit, and manage user groups for access control.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium'
        >
          {showCreateForm ? 'Cancel' : '+ Add Group'}
        </button>
      </header>

      {error && (
        <div className='rounded-lg bg-red-900/20 border border-red-900 p-4'>
          <p className='text-red-400 text-sm'>{error}</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
          <h2 className='text-xl font-semibold mb-4'>Create New Group</h2>
          <form action={handleCreate} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Group Name *</label>
                <input
                  type='text'
                  name='name'
                  required
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Group name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Type</label>
                <select
                  name='type'
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='custom'>Custom</option>
                  <option value='domain'>Domain</option>
                </select>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Domain (for domain groups)</label>
              <input
                type='text'
                name='domain'
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='example.com'
              />
              <p className='text-xs text-zinc-500 mt-1'>
                Only required for domain-based groups
              </p>
            </div>
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50'
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type='button'
                onClick={() => setShowCreateForm(false)}
                className='px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingGroup && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
          <h2 className='text-xl font-semibold mb-4'>Edit Group</h2>
          <form action={handleUpdate} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Group Name *</label>
                <input
                  type='text'
                  name='name'
                  required
                  defaultValue={editingGroup.name}
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Type</label>
                <select
                  name='type'
                  defaultValue={editingGroup.type}
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='custom'>Custom</option>
                  <option value='domain'>Domain</option>
                </select>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Domain (for domain groups)</label>
              <input
                type='text'
                name='domain'
                defaultValue={editingGroup.domain || ''}
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='example.com'
              />
            </div>
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50'
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type='button'
                onClick={() => setEditingGroup(null)}
                className='px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
        <h2 className='text-xl font-semibold mb-4'>Existing Groups ({groups.length})</h2>
        <div className='space-y-3'>
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.id} className='flex items-center justify-between p-4 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors'>
                <div className='flex items-center gap-3'>
                  <h3 className='font-medium text-lg'>{group.name}</h3>
                  <span className='text-xs px-2 py-1 bg-zinc-700 rounded text-zinc-300'>
                    {group.type}
                  </span>
                  {group.domain && (
                    <span className='text-xs px-2 py-1 bg-blue-900/40 text-blue-300 rounded border border-blue-700'>
                      {group.domain}
                    </span>
                  )}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setEditingGroup(group)}
                    className='px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    disabled={isSubmitting}
                    className='px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className='text-zinc-400 text-center py-8'>No groups found. Click "Add Group" to create one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
