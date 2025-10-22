// edge-functions/onAuthSignup/index.ts
// Minimal onAuth handler: ensure domain group exists + membership for new users.
// Deploy with Supabase CLI or run as webhook invoked after sign-in.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  const body = await req.json().catch(()=>null);
  const { record } = body ?? {};
  const email: string | undefined = record?.email;
  const user_id: string | undefined = record?.id;
  if (!email || !user_id) return new Response('missing user', { status: 400 });

  const domain = email.split('@')[1]?.toLowerCase();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const fetcher = (path: string, init: RequestInit = {}) =>
    fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });

  // Upsert domain group
  const groupRes = await fetcher('s42_groups?select=id&domain=eq.' + domain);
  let group = await groupRes.json();
  let group_id = group?.[0]?.id;
  if (!group_id) {
    const createRes = await fetcher('s42_groups', {
      method: 'POST',
      body: JSON.stringify({ name: domain, type: 'domain', domain })
    });
    const created = await createRes.json();
    group_id = created?.[0]?.id;
  }

  if (!group_id) return new Response('group failure', { status: 500 });

  // Ensure membership
  await fetcher('s42_user_groups', {
    method: 'POST',
    body: JSON.stringify({ user_id, group_id }),
  });

  return new Response('ok', { status: 200 });
});
