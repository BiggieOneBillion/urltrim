// File: middleware.ts (at the root of your project)
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Check for token in authorization header as well
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : null;
    
  const accessToken = token || bearerToken;

  // If there's no token, return unauthorized response or redirect
  if (!accessToken) {
    // For API routes, return JSON response
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: "Not authorized to access this route" },
        { status: 401 }
      );
    }
    // For page routes, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    
    const { payload } = await jwtVerify(accessToken, secret);
    
    // Add user ID to headers for route handlers to access
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id as string);
    console.log('AUTH PASSED FOR THIS ROUTE')
    // Continue to the protected route with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // If token is invalid, return unauthorized or redirect
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: "Not authorized to access this route" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Define which routes should be protected
export const config = {
  matcher: [
    '/api/protected/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    // Add other protected routes here
  ],
};

