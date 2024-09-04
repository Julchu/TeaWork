import { NextRequest, NextResponse } from 'next/server';
import { getMiddleware } from 'src/lib/getMiddleware';

const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();
  if (
    request.nextUrl.pathname.startsWith('/') &&
    request.method === 'GET' &&
    request.cookies.has('__session')
  )
    await getMiddleware(request, response);

  return response;
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

export default middleware;