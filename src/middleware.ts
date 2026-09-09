import { NextRequest, NextResponse } from "next/server";

const AUTH_URL = (process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.yesp.space").replace(/\/$/, "");

function corsHeaders(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (origin) {
    try {
      const url = new URL(origin);
      res.headers.set("Access-Control-Allow-Origin", url.origin);
    } catch {
      res.headers.set("Access-Control-Allow-Origin", "*");
    }
  } else {
    res.headers.set("Access-Control-Allow-Origin", "*");
  }
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  return res;
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return corsHeaders(request, new NextResponse(null, { status: 204 }));
  }

  const { pathname, search } = request.nextUrl;

  // Allow: console, bridge, api proxy, root
  const allowed =
    pathname === "/" ||
    pathname.startsWith("/console") ||
    pathname.startsWith("/bridge") ||
    pathname.startsWith("/auth/smart-login/approve") ||
    pathname.startsWith("/api");

  if (!allowed) {
    return corsHeaders(request, NextResponse.redirect(`${AUTH_URL}/auth/login`));
  }

  return corsHeaders(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|og-image\\.png|manifest\\.json|sitemap\\.xml|robots\\.txt).*)"],
};
