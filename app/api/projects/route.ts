import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const includeFelNames = searchParams.get('fel_names') === 'true';

  if (includeFelNames) {
    // Return FEL names from a predefined source
    const felNames = [
      {
        "code": 1.01,
        "name": "Meets basic criteria",
        "phase": 1,
        "colour": "#00FF00"
      },
      {
        "code": 1.02,
        "name": "Draft business case",
        "phase": 1,
        "colour": "#00FF00"
      },
      {
        "code": 1.03,
        "name": "Engaged Stakeholders",
        "phase": 1,
        "colour": "#00FF00"
      },
      {
        "code": 1.04,
        "name": "Initial project plan",
        "phase": 1,
        "colour": "#00FF00"
      },
      {
        "code": 2.01,
        "name": "Grid and Power Term Sheet",
        "phase": 2,
        "colour": "#00FF00"
      },
      {
        "code": 2.02,
        "name": "Customer Term Sheet",
        "phase": 2,
        "colour": "#00FF00"
      },
      {
        "code": 2.03,
        "name": "Zoned Land In Place",
        "phase": 2,
        "colour": "#FFFF00"
      },
      {
        "code": 2.04,
        "name": "Conceptual Design",
        "phase": 2,
        "colour": "#FFFF00"
      },
      {
        "code": 2.05,
        "name": "Execution Plan",
        "phase": 2,
        "colour": "#FFFF00"
      },
      {
        "code": 2.06,
        "name": "Financing Plan",
        "phase": 2,
        "colour": "#FFFF00"
      },
      {
        "code": 2.07,
        "name": "Business Case",
        "phase": 2,
        "colour": "#FFFF00"
      },
      {
        "code": 3.01,
        "name": "Customer Definitive Agreements",
        "phase": 3,
        "colour": "#FFFF00"
      },
      {
        "code": 3.02,
        "name": "Grid Access Secured",
        "phase": 3,
        "colour": "#FFFF00"
      },
      {
        "code": 3.03,
        "name": "Power Contract Secured",
        "phase": 3,
        "colour": "#FF0000"
      },
      {
        "code": 3.04,
        "name": "Zoned Land Secured",
        "phase": 3,
        "colour": "#FF0000"
      },
      {
        "code": 3.05,
        "name": "Detailed Engineering Design",
        "phase": 3,
        "colour": "#FF0000"
      },
      {
        "code": 3.06,
        "name": "Full EPC Basis Secured",
        "phase": 3,
        "colour": "#FF0000"
      },
      {
        "code": 3.07,
        "name": "LLI Equipment Suppliers Selected",
        "phase": 3,
        "colour": "#FF0000"
      },
      {
        "code": 3.08,
        "name": "SLA agreements In Place",
        "phase": 3,
        "colour": "#FF0000"
      },
      {
        "code": 3.09,
        "name": "All permits In Place (ESIA etc)",
        "phase": 3,
        "colour": "#FF0000"
      },
      {
        "code": 3.1,
        "name": "Financing Secured (Debt and Equity)",
        "phase": 3,
        "colour": "#FF0000"
      }
    ];
    return NextResponse.json({ fel_names: felNames });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/s42_projects?select=id,name,project_key,created_at`, {
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.text();
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: payload },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
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

  let body: any;
  try {
    body = await req.json();
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, project_key, template_code } = body;

  // Validate required fields
  if (!name || !project_key) {
    return NextResponse.json(
      { error: 'Project name and key are required' },
      { status: 400 }
    );
  }

  // If no template, create a simple project directly
  if (!template_code) {
    try {
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/s42_projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          name,
          project_key,
          meta: {},
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        return NextResponse.json(
          { error: 'Failed to create project', details: errorText },
          { status: createResponse.status }
        );
      }

      const project = await createResponse.json();
      return NextResponse.json({
        project: project[0],
        tasks_created: 0,
        message: 'Project created successfully'
      });
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to create project', details: err },
        { status: 500 }
      );
    }
  }

  // If template provided, use edge function
  const response = await fetch(
    `${supabaseUrl}/functions/v1/create_project_from_template`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        apikey: serviceKey,
      },
      body: JSON.stringify(body),
    },
  );

  const text = await response.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (_err) {
    payload = { error: text || 'Unexpected response from edge function' };
  }

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' && payload && 'error' in payload
        ? (payload as { error: string }).error
        : 'Edge function invocation failed';
    return NextResponse.json(
      { error: errorMessage, details: payload },
      { status: response.status },
    );
  }

  return NextResponse.json(payload);
}
