import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 }
    );
  }

  try {
    const query = `${supabaseUrl}/rest/v1/s42_task_assignees?task_id=eq.${params.id}&select=user_id,s42_users(id,email,display_name,avatar_url)`;

    const response = await fetch(query, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const payload = await response.text();
      console.error('Error fetching assignees:', payload);
      return NextResponse.json(
        { error: 'Failed to fetch assignees', details: payload },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Transform the data to return user objects
    const assignees = data?.map((item: any) => item.s42_users).filter(Boolean) || [];

    return NextResponse.json(assignees);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { user_ids } = body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: 'user_ids must be a non-empty array' },
        { status: 400 }
      );
    }

    // Insert multiple assignees
    const assignees = user_ids.map(user_id => ({
      task_id: params.id,
      user_id,
    }));

    const response = await fetch(`${supabaseUrl}/rest/v1/s42_task_assignees`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(assignees),
    });

    if (!response.ok) {
      const payload = await response.text();
      console.error('Error adding assignees:', payload);
      return NextResponse.json(
        { error: 'Failed to add assignees', details: payload },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/s42_task_assignees?task_id=eq.${params.id}&user_id=eq.${user_id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      }
    );

    if (!response.ok) {
      const payload = await response.text();
      console.error('Error removing assignee:', payload);
      return NextResponse.json(
        { error: 'Failed to remove assignee', details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
