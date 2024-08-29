import { NextRequest, NextResponse } from 'next/server';
import { getMiddleware } from 'src/app/get/getMiddleware';

const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/') && request.method === 'GET') {
    await getMiddleware(request, response);
    // const requestCookies = request.cookies.getAll();
    // requestCookies.forEach(requestCookie =>
    //   response.cookies.set(requestCookie.name, requestCookie.value),
    // );
  }

  return response;
};

export default middleware;