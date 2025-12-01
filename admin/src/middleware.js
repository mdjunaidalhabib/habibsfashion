import { NextResponse } from "next/server";

function isJwtExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf8")
    );

    // exp সেকেন্ডে থাকে
    if (!payload?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

export function middleware(req) {
  const token = req.cookies.get("admin_token")?.value || "";
  const { pathname, origin } = req.nextUrl;

  const isProd = process.env.NODE_ENV === "production";

  // 🌀 Dev Debug Log
  if (!isProd) {
    console.log("🌀 [Middleware Triggered]:", pathname);
    console.log("🔑 Token Found:", token ? "✅ Yes" : "❌ No");
  }

  // ✅ token থাকলে কিন্তু expire হলে → cookie clear + login redirect
  if (token && isJwtExpired(token)) {
    if (!isProd) console.log("⏳ Token expired → clearing cookie + redirect");

    const res = NextResponse.redirect(`${origin}/login`);

    // cookie clear (client side)
    res.cookies.set("admin_token", "", {
      path: "/",
      expires: new Date(0),
    });

    return res;
  }

  // 🔒 Protected routes (/admin)
  if (pathname.startsWith("/admin") && !token) {
    const redirectUrl = `${origin}/login`;
    if (!isProd) console.log("🔁 Redirecting to:", redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  // 🚫 Prevent logged-in admins from seeing login again
  if (pathname.startsWith("/login") && token) {
    const redirectUrl = `${origin}/admin/dashboard`;
    if (!isProd)
      console.log("🚀 Already logged in → Redirecting to:", redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// ✅ Middleware Scope
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
