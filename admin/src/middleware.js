import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("admin_token")?.value || "";
  const { pathname, origin } = req.nextUrl;

  // 🌀 Middleware Log (development only)
  if (process.env.NODE_ENV !== "production") {
    console.log("🌀 [Middleware Triggered]:", pathname);
  }

  // 🛡️ Protected route: admin panel
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // 🚫 Prevent logged-in admin from going to login page again
  if (pathname.startsWith("/login") && token) {
    return NextResponse.redirect(`${origin}/admin/dashboard`);
  }

  // ✅ Everything okay, continue
  return NextResponse.next();
}

// ✅ Middleware scope
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
