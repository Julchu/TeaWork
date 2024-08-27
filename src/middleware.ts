import { NextRequest, NextResponse } from 'next/server';
import { getMiddleware } from 'src/app/get/getMiddleware';

const middleware = async (request: NextRequest) => {
  if (request.method !== 'GET') {
    return;
  }
  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/')) await getMiddleware(request, response);

  return response;
};

export default middleware;