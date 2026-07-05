import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSessionTokenEdge } from "@/lib/auth/session-edge";

const CITIZEN_PROTECTED = [
  "/citizen/dashboard",
  "/citizen/grievances",
  "/citizen/issues",
  "/citizen/notifications",
  "/citizen/mp",
  "/citizen/history",
  "/citizen/profile",
];
const MP_PROTECTED = ["/mp/dashboard", "/mp/issues"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("proxima_session")?.value;
  const session = token ? await parseSessionTokenEdge(token) : null;

  const isCitizenRoute = CITIZEN_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isMpRoute = MP_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isCitizenRoute) {
    if (!session) {
      const loginUrl = new URL("/citizen/login", request.url);
      loginUrl.searchParams.set("reason", "session_required");
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "citizen") {
      const home = new URL("/", request.url);
      home.searchParams.set("reason", "wrong_portal");
      home.searchParams.set("active", session.role);
      return NextResponse.redirect(home);
    }
  }

  if (isMpRoute) {
    if (!session) {
      const loginUrl = new URL("/mp/login", request.url);
      loginUrl.searchParams.set("reason", "session_required");
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "mp") {
      const home = new URL("/", request.url);
      home.searchParams.set("reason", "wrong_portal");
      home.searchParams.set("active", session.role);
      return NextResponse.redirect(home);
    }
  }

  if (session) {
    if (pathname === "/citizen/login" || pathname === "/citizen/register") {
      if (session.role === "citizen") {
        return NextResponse.redirect(new URL("/citizen/dashboard", request.url));
      }
      return NextResponse.next();
    }
    if (pathname === "/mp/login") {
      if (session.role === "mp") {
        return NextResponse.redirect(new URL("/mp/dashboard", request.url));
      }
      return NextResponse.next();
    }
  }

  if (pathname === "/citizen" || pathname === "/mp-dashboard") {
    const dest = pathname.startsWith("/citizen") ? "/citizen/login" : "/mp/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/citizen/:path*", "/mp/:path*", "/mp-dashboard"],
};