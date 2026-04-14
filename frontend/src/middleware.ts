import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Landing domain: wicketchain.com (or localhost:3000 for dev)
  // App domain: app.wicketchain.com (or localhost:3001 or app.localhost:3000 for dev)
  const hostname = request.headers.get("host") || "";
  const isAppSubdomain =
    hostname.startsWith("app.") || hostname.startsWith("app.localhost");

  // If on app subdomain, rewrite root to /matches as the app home
  if (isAppSubdomain && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/matches";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon|branding|.*\\..*).*)"],
};
