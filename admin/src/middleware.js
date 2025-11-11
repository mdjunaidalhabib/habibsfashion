import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("admin_token")?.value || "";
  const { pathname, origin } = req.nextUrl;

  // 🌀 Middleware Trigger Log
  console.log("🌀 [Middleware Triggered]:", pathname);

  // ✅ যদি token না থাকে এবং protected route এ ঢোকে
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  // ✅ যদি already login করা থাকে → login page এ না ঢুকতে দেই
  if (pathname.startsWith("/login") && token) {
    return NextResponse.redirect(`${origin}/admin/dashboard`);
  }

  // ✅ Default: সব ঠিক থাকলে proceed করো
  return NextResponse.next();
}

// ✅ কোন route এ middleware কাজ করবে
export const config = {
  matcher: ["/admin/:path*"],
};
