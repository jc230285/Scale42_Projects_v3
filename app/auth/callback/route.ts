import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('redirect_to') ?? '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    const redirectUrl = new URL('/login', requestUrl.origin);
    redirectUrl.searchParams.set('error', error);
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=Missing+code', requestUrl.origin));
  }

  const supabase = createRouteHandlerClient({ cookies });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const redirectUrl = new URL('/login', requestUrl.origin);
    redirectUrl.searchParams.set('error', exchangeError.message);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
