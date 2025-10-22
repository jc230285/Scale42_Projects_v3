import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  let query = `${supabaseUrl}/rest/v1/s42_tasks?select=id,project_id,title,status,fields,sort_order,task_type,task_topic,budget,start_date,end_date,lead_id,notes,third_party,s42_projects(*),lead:s42_users!lead_id(id,email,display_name,avatar_url),assignees:s42_task_assignees(user:s42_users(id,email,display_name,avatar_url))`;

  if (projectId) {
    query += `&project_id=eq.${projectId}`;
  }

  const response = await fetch(query, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.text();
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: payload },
      { status: response.status },
    );
  }

  const data = await response.json();

  // Group tasks by project
  const projectsMap = new Map();

  data.forEach((task: any) => {
    const project = task.s42_projects;
    const projectId = project.id;

    if (!projectsMap.has(projectId)) {
      projectsMap.set(projectId, {
        ...project,
        tasks: []
      });
    }

    // Remove the nested project from the task and add it to the project's tasks array
    const { s42_projects, ...taskWithoutProject } = task;
    projectsMap.get(projectId).tasks.push(taskWithoutProject);
  });

  const nestedData = Array.from(projectsMap.values());

  return NextResponse.json(nestedData);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Debug logging
  console.log('[POST /api/tasks] Session:', JSON.stringify(session, null, 2));
  
  if (!session || !session.user || !session.user.id) {
    console.log('[POST /api/tasks] Authentication failed - session:', !!session, 'user:', !!session?.user, 'user.id:', session?.user?.id);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { project_id, title, status, sort_order, ...otherFields } = body;

    if (!project_id || !title) {
      return NextResponse.json({ error: 'project_id and title are required' }, { status: 400 });
    }

    const taskData = {
      project_id,
      title,
      status: status || 'todo',
      sort_order: sort_order || 0,
      ...otherFields,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/s42_tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Task creation error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create task', details: errorText },
        { status: response.status },
      );
    }

    const createdTask = await response.json();

    // Log the task creation
    await fetch(`${supabaseUrl}/rest/v1/s42_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 'task creation',
        page: 'projects',
        user_id: session.user.id,
        level: 'info',
        task_name: title,
        field: 'status',
        update_value: status || 'todo'
      }),
    });

    return NextResponse.json({ success: true, data: createdTask[0] });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Debug logging
  console.log('[PATCH /api/tasks] Session:', JSON.stringify(session, null, 2));
  
  if (!session || !session.user || !session.user.id) {
    console.log('[PATCH /api/tasks] Authentication failed - session:', !!session, 'user:', !!session?.user, 'user.id:', session?.user?.id);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Get the current task data before update for logging
    const fetchResponse = await fetch(
      `${supabaseUrl}/rest/v1/s42_tasks?id=eq.${id}&select=id,title,status,task_type,task_topic,budget,start_date,end_date,lead_id,notes,third_party`,
      {
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      }
    );

    if (!fetchResponse.ok) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const currentTask = await fetchResponse.json();

    if (!currentTask || currentTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskBefore = currentTask[0];

    // Update the task in Supabase
    const updateQuery = `${supabaseUrl}/rest/v1/s42_tasks?id=eq.${id}`;

    const updateResponse = await fetch(updateQuery, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();

      // Log the failed update attempt
      await fetch(`${supabaseUrl}/rest/v1/s42_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'task update',
          page: 'projects',
          user_id: session.user.id,
          level: 'error',
          task_name: taskBefore.title,
          field: Object.keys(updates)[0],
          update_value: updates,
          error: errorText
        }),
      });

      console.error('Supabase update error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update task', details: errorText },
        { status: updateResponse.status },
      );
    }

    const updatedData = await updateResponse.json();
    const taskAfter = updatedData[0];

    // Log the successful update
    const changedFields = Object.keys(updates);
    for (const field of changedFields) {
      await fetch(`${supabaseUrl}/rest/v1/s42_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'task update',
          page: 'projects',
          user_id: session.user.id,
          level: 'info',
          task_name: taskBefore.title,
          field: field,
          update_value: {
            from: taskBefore[field],
            to: taskAfter[field]
          }
        }),
      });
    }

    return NextResponse.json({ success: true, data: taskAfter });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}