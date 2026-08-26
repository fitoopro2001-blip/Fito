import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COUNTRY_COOKIE } from '@/utils/country';

// Vercel's edge sets this on every request based on the visitor's real IP —
// it can't be spoofed by the client on an actual Vercel deployment. Stashed
// into a cookie so both Server Components (via next/headers' cookies()) and
// the client CountryContext can read a single consistent value for the
// request without each re-deriving it.
export function proxy(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase() || '';

  const response = NextResponse.next();
  response.cookies.set(COUNTRY_COOKIE, country, {
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js)$).*)'],
};
