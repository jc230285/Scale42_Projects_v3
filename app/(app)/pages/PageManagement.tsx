'use client';

import { useState } from 'react';
import { createPage, updatePage, deletePage, updatePageOrder } from './actions';

type Page = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  content_mdx: string;
  group_ids: string[];
};

type Category = {
  id: string;
  name: string;
};

type Group = {
  id: string;
  name: string;
};

type Props = {
  pages: Page[];
  categories: Category[];
  allGroups: Group[];
};

export default function PageManagement({ pages: initialPages, categories, allGroups }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState(initialPages);

  async function movePageUp(index: number) {
    if (index === 0) return;

    const newPages = [...pages];
    [newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]];
    setPages(newPages);

    // Update sort order in database
    await updatePageOrderInDB(newPages);
  }

  async function movePageDown(index: number) {
    if (index === pages.length - 1) return;

    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    setPages(newPages);

    // Update sort order in database
    await updatePageOrderInDB(newPages);
  }

  async function updatePageOrderInDB(orderedPages: Page[]) {
    const pageIds = orderedPages.map(page => page.id);
    const result = await updatePageOrder(pageIds);
    if (result.error) {
      setError(result.error);
    }
  }

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    const result = await createPage(formData);
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else {
      setShowCreateForm(false);
      // Form will be cleared on page refresh
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingPage) return;
    
    setIsSubmitting(true);
    setError(null);
    const result = await updatePage(editingPage.id, formData);
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else {
      setEditingPage(null);
    }
  }

  async function handleDelete(pageId: string) {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    setIsSubmitting(true);
    setError(null);
    const result = await deletePage(pageId);
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className='space-y-6'>
      <header className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-semibold'>Page Management</h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Create, edit, and manage pages in your application.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium'
        >
          {showCreateForm ? 'Cancel' : '+ Add Page'}
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
          <h2 className='text-xl font-semibold mb-4'>Create New Page</h2>
          <form action={handleCreate} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Title *</label>
                <input
                  type='text'
                  name='title'
                  required
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Page title'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Slug *</label>
                <input
                  type='text'
                  name='slug'
                  required
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='page-slug'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Category</label>
              <select
                name='category_id'
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Access Groups</label>
              <div className='space-y-2 p-3 bg-zinc-800 rounded-lg max-h-48 overflow-y-auto'>
                {allGroups.map((group) => (
                  <label key={group.id} className='flex items-center'>
                    <input
                      type='checkbox'
                      name='group_ids'
                      value={group.id}
                      className='mr-2'
                    />
                    <span className='text-sm'>{group.name}</span>
                  </label>
                ))}
              </div>
              <p className='text-xs text-zinc-500 mt-1'>
                Leave unchecked for public access
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Content (MDX)</label>
              <textarea
                name='content_mdx'
                rows={6}
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm'
                placeholder='Page content in MDX format'
              />
            </div>
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50'
              >
                {isSubmitting ? 'Creating...' : 'Create Page'}
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
      {editingPage && (
        <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
          <h2 className='text-xl font-semibold mb-4'>Edit Page</h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Address: <span className='font-mono text-blue-400'>/pages/{editingPage.slug}</span>
          </p>
          <form action={handleUpdate} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Title *</label>
                <input
                  type='text'
                  name='title'
                  required
                  defaultValue={editingPage.title}
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Slug *</label>
                <input
                  type='text'
                  name='slug'
                  required
                  defaultValue={editingPage.slug}
                  className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Category</label>
              <select
                name='category_id'
                defaultValue={editingPage.category_id || ''}
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Access Groups</label>
              <div className='space-y-2 p-3 bg-zinc-800 rounded-lg max-h-48 overflow-y-auto'>
                {allGroups.map((group) => (
                  <label key={group.id} className='flex items-center'>
                    <input
                      type='checkbox'
                      name='group_ids'
                      value={group.id}
                      defaultChecked={editingPage.group_ids.includes(group.id)}
                      className='mr-2'
                    />
                    <span className='text-sm'>{group.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Content (MDX)</label>
              <textarea
                name='content_mdx'
                rows={6}
                defaultValue={editingPage.content_mdx}
                className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm'
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
                onClick={() => setEditingPage(null)}
                className='px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/60 p-6'>
        <h2 className='text-xl font-semibold mb-4'>Existing Pages ({pages.length})</h2>
        <div className='space-y-3'>
          {pages.length > 0 ? (
            pages.map((page, index) => {
              const categoryName = categories.find(c => c.id === page.category_id)?.name;
              const pageGroups = page.group_ids
                .map(gid => allGroups.find(g => g.id === gid))
                .filter(Boolean);

              return (
                <div key={page.id} className='flex items-center justify-between p-4 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors'>
                  <div className='flex items-center gap-3 flex-1'>
                    <div className='flex flex-col'>
                      <span className='text-xs text-zinc-500'>#{index + 1}</span>
                      <div className='flex gap-1'>
                        <button
                          onClick={() => movePageUp(index)}
                          disabled={index === 0}
                          className='p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed'
                          title='Move up'
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => movePageDown(index)}
                          disabled={index === pages.length - 1}
                          className='p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed'
                          title='Move down'
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-lg'>{page.title}</h3>
                      <p className='text-sm text-zinc-400'>Slug: /{page.slug}</p>
                      <div className='flex items-center gap-3 mt-1'>
                        {categoryName && (
                          <span className='text-xs px-2 py-1 bg-zinc-700 rounded text-zinc-300'>
                            {categoryName}
                          </span>
                        )}
                        <div className='flex flex-wrap gap-2'>
                          {pageGroups.length > 0 ? (
                            pageGroups.map((group) => (
                              <span
                                key={group!.id}
                                className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-700'
                              >
                                {group!.name}
                              </span>
                            ))
                          ) : (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/40 text-green-300 border border-green-700'>
                              Public
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex gap-2 ml-4'>
                    <button
                      onClick={() => setEditingPage(page)}
                      className='px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      disabled={isSubmitting}
                      className='px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className='text-zinc-400 text-center py-8'>No pages found. Click "Add Page" to create one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
