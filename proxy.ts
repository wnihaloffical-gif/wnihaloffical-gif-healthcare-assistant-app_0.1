import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware for routing configuration
 * Client-side components handle authentication checks
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require auth
  const publicPaths = ["/", "/auth/login", "/auth/register"]

  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // Since cookies() is async in Next.js 16, we let client-side handle redirects
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
