import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not configured' },
      { status: 500 }
    );
  }

  try {
    // Query to get enum values from PostgreSQL
    const query = `${supabaseUrl}/rest/v1/rpc/get_enum_values`;
    
    // Alternative: Direct SQL query via Supabase
    // We'll use a simple approach - query the information schema
    const enumQuery = `
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname IN ('task_status', 'task_type', 'task_topic')
      GROUP BY t.typname
    `;

    // For now, return the hardcoded values that match your database
    // In a real implementation, you'd query the database
    const enums = {
      task_status: ['todo', 'in_progress', 'blocked', 'done'],
      task_type: [
        'Application',
        'Decision Gate',
        'Design',
        'Investigation',
        'Negotiations',
        'Permit',
        'Presentation',
        'Report',
        'Study',
        'Travel',
        'Work Package'
      ],
      task_topic: [
        'Cooling',
        'Design',
        'ESG',
        'Fibre',
        'Heat Reuse',
        'Land',
        'Local Engagement',
        'Organisation',
        'Other',
        'Power',
        'Restrictions',
        'Studies',
        'Travel',
        'Zoning & Permit'
      ]
    };

    return NextResponse.json(enums);
  } catch (error) {
    console.error('Error fetching enum types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enum types' },
      { status: 500 }
    );
  }
}
