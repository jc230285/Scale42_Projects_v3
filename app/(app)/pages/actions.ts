'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServiceRole } from '@/lib/supabaseService';

export async function createPage(formData: FormData) {
  const supabase = supabaseServiceRole();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const categoryId = formData.get('category_id') as string;
  const contentMdx = formData.get('content_mdx') as string;
  const groupIds = formData.getAll('group_ids') as string[];

  if (!title || !slug) {
    return { error: 'Title and slug are required' };
  }

  try {
    // Create the page
    const { data: page, error: pageError } = await supabase
      .from('s42_pages')
      .insert({
        title,
        slug,
        category_id: categoryId || null,
        content_mdx: contentMdx || '',
      })
      .select()
      .single();

    if (pageError) {
      return { error: pageError.message };
    }

    // Add group associations if any groups were selected
    if (groupIds.length > 0 && page) {
      const pageGroups = groupIds.map(groupId => ({
        page_id: page.id,
        group_id: groupId,
      }));

      const { error: pgError } = await supabase
        .from('s42_page_groups')
        .insert(pageGroups);

      if (pgError) {
        return { error: pgError.message };
      }
    }

    revalidatePath('/pages');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePage(pageId: string, formData: FormData) {
  const supabase = supabaseServiceRole();

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const categoryId = formData.get('category_id') as string;
  const contentMdx = formData.get('content_mdx') as string;
  const groupIds = formData.getAll('group_ids') as string[];

  if (!title || !slug) {
    return { error: 'Title and slug are required' };
  }

  try {
    // Update the page
    const { error: pageError } = await supabase
      .from('s42_pages')
      .update({
        title,
        slug,
        category_id: categoryId || null,
        content_mdx: contentMdx || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId);

    if (pageError) {
      return { error: pageError.message };
    }

    // Delete existing group associations
    await supabase
      .from('s42_page_groups')
      .delete()
      .eq('page_id', pageId);

    // Add new group associations
    if (groupIds.length > 0) {
      const pageGroups = groupIds.map(groupId => ({
        page_id: pageId,
        group_id: groupId,
      }));

      const { error: pgError } = await supabase
        .from('s42_page_groups')
        .insert(pageGroups);

      if (pgError) {
        return { error: pgError.message };
      }
    }

    revalidatePath('/pages');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePage(pageId: string) {
  const supabase = supabaseServiceRole();

  try {
    // Delete the page (cascade will handle s42_page_groups)
    const { error } = await supabase
      .from('s42_pages')
      .delete()
      .eq('id', pageId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/pages');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePageOrder(pageIds: string[]) {
  const supabase = supabaseServiceRole();

  try {
    // Update sort_order for each menu item corresponding to the pages
    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i];
      const sortOrder = i + 1;

      // Find the menu item that links to this page
      const { data: menuItem } = await supabase
        .from('s42_menu_items')
        .select('id')
        .eq('page_id', pageId)
        .single();

      if (menuItem) {
        const { error } = await supabase
          .from('s42_menu_items')
          .update({ sort_order: sortOrder })
          .eq('id', menuItem.id);

        if (error) {
          return { error: error.message };
        }
      }
    }

    revalidatePath('/pages');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
