import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function middleware(request: NextRequest) {
  // Only proxy API requests to backend
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Create the backend URL
    const url = new URL(request.nextUrl.pathname, BACKEND_URL);
    url.search = request.nextUrl.search;

    // Create a new request headers object
    const requestHeaders = new Headers(request.headers);

    // Don't let the middleware modify the cookie header
    // This will ensure the original cookie header gets forwarded as-is
    const response = NextResponse.rewrite(url, {
      request: {
        // Forward headers but don't modify them
        headers: requestHeaders
      }
    });

    // Don't attempt to set or manage cookies in the middleware
    // Let the browser handle the cookies based on the original headers

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
