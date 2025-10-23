'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServiceRole } from '../../../lib/supabaseService';

export async function createGroup(formData: FormData) {
  const supabase = supabaseServiceRole();

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const domain = formData.get('domain') as string;

  if (!name) {
    return { error: 'Group name is required' };
  }

  try {
    const { data: group, error } = await supabase
      .from('s42_groups')
      .insert({
        name,
        type: type || 'custom',
        domain: domain || null,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/groups');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateGroup(groupId: string, formData: FormData) {
  const supabase = supabaseServiceRole();

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const domain = formData.get('domain') as string;

  if (!name) {
    return { error: 'Group name is required' };
  }

  try {
    const { error } = await supabase
      .from('s42_groups')
      .update({
        name,
        type: type || 'custom',
        domain: domain || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/groups');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteGroup(groupId: string) {
  const supabase = supabaseServiceRole();

  try {
    // Check if group has any users
    const { data: userGroups } = await supabase
      .from('s42_user_groups')
      .select('user_id')
      .eq('group_id', groupId);

    if (userGroups && userGroups.length > 0) {
      return { error: 'Cannot delete group with active members. Remove all members first.' };
    }

    // Check if group has any page assignments
    const { data: pageGroups } = await supabase
      .from('s42_page_groups')
      .select('page_id')
      .eq('group_id', groupId);

    if (pageGroups && pageGroups.length > 0) {
      return { error: 'Cannot delete group with assigned pages. Remove all page assignments first.' };
    }

    const { error } = await supabase
      .from('s42_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/groups');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
