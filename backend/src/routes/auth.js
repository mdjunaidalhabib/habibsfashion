import express from "express";
import passport from "passport";

const router = express.Router();

// 🔹 Middleware: login চেক
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not logged in" });
}

// 🔹 Google Login
router.get("/google", (req, res, next) => {
  const redirect = req.query.redirect || `${process.env.CLIENT_URL}/checkout`;
  console.log("👉 /auth/google called. Redirect param =", redirect);

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
    accessType: "offline",
    state: encodeURIComponent(redirect), // ✅ redirect কে state এ পাঠাচ্ছি
  })(req, res, next);
});

// 🔹 Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    // ✅ state থেকে redirect URL বের করো
    const redirectUrl = req.query.state
      ? decodeURIComponent(req.query.state)
      : `${process.env.CLIENT_URL}/checkout`;

    console.log("➡️ Redirecting user to:", redirectUrl);
    res.redirect(redirectUrl);
  }
);

// 🔹 Logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.status(200).json({ message: "Logged out" });
    });
  });
});

// 🔹 Current user
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  res.json(req.user);
});

// 🔹 Checkout secure route
router.get("/checkout", isLoggedIn, (req, res) => {
  res.json({ user: req.user, message: "Proceed to checkout" });
});

export default router;
