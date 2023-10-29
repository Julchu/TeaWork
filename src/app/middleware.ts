import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export const middleware = async (request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith('/settings')) {
    return NextResponse.rewrite(new URL('/other-examples', request.url));
  }
};

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
};