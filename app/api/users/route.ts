import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('[GET /api/users] Request received');
  
  const session = await getServerSession(authOptions);
  console.log('[GET /api/users] Session:', session ? 'authenticated' : 'not authenticated');
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!supabaseUrl || !serviceKey) {
    console.error('[GET /api/users] Missing environment variables');
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  try {
    let query = `${supabaseUrl}/rest/v1/s42_users?select=id,email,display_name,avatar_url&order=display_name.asc.nullsfirst,email.asc`;

    // Apply search filter if provided
    if (search) {
      query += `&or=(email.ilike.*${search}*,display_name.ilike.*${search}*)`;
    }

    console.log('[GET /api/users] Query:', query);

    const response = await fetch(query, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      cache: 'no-store',
    });

    console.log('[GET /api/users] Response status:', response.status);

    if (!response.ok) {
      const payload = await response.text();
      console.error('[GET /api/users] Error response:', payload);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: payload },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[GET /api/users] Success, returned', data.length, 'users');
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[GET /api/users] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: String(error) },
      { status: 500 }
    );
  }
}
