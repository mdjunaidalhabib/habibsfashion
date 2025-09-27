import express from "express";
import passport from "passport";
const router = express.Router();

// 🔹 Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not logged in" });
}

// 🔹 Allowed origins
const rawOrigins =
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

function safeRedirectUrl(urlFromState) {
  try {
    const u = new URL(urlFromState);
    if (allowedOrigins.includes(u.origin)) {
      return urlFromState;
    }
    return allowedOrigins[0];
  } catch {
    return allowedOrigins[0];
  }
}

// 🔹 Google Login
router.get("/google", (req, res, next) => {
  const defaultRedirect = `${allowedOrigins[0]}/profile`;
  const redirect = req.query.redirect || defaultRedirect;
  const finalRedirect = safeRedirectUrl(redirect);

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
    accessType: "offline",
    state: encodeURIComponent(finalRedirect),
  })(req, res, next);
});

// 🔹 Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${allowedOrigins[0]}/login`,
  }),
  (req, res) => {
    const defaultRedirect = `${allowedOrigins[0]}/profile`;
    const stateRedirect = req.query.state
      ? decodeURIComponent(req.query.state)
      : defaultRedirect;
    const redirectUrl = safeRedirectUrl(stateRedirect);

    res.redirect(redirectUrl);
  }
);

// 🔹 Logout (cookie name fixed)
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("sid", { // 👈 must match session name
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: "/",
      });
      res.status(200).json({ message: "Logged out" });
    });
  });
});

// 🔹 Current user
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  const { _id, name, email, avatar, createdAt } = req.user;
  res.json({ _id, name, email, avatar, createdAt });
});

// 🔹 Checkout
router.get("/checkout", isLoggedIn, (req, res) => {
  const { _id, name, email } = req.user;
  res.json({ user: { _id, name, email }, message: "Proceed to checkout" });
});

export default router;
