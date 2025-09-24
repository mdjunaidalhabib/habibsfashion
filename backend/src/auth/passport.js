import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export function configurePassport() {
  const callbackURL = `${process.env.AUTH_API_URL}/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
        scope: ["profile", "email"],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const name = profile.displayName || "User";
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const avatar = profile.photos?.[0]?.value || "";

          // 1) First try by googleId
          let user = await User.findOne({ googleId });

          // 2) If not found, try by email
          if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              if (!user.avatar && avatar) user.avatar = avatar;
              if (!user.name && name) user.name = name;
              await user.save();
            }
          }

          // 3) If still not found, create new
          if (!user) {
            const fallbackEmail =
              email || `noemail-${googleId}@example.local`;
            user = await User.create({
              googleId,
              name,
              email: fallbackEmail,
              avatar,
            });
          }

          console.log("✅ Google login success:", user._id.toString());
          return done(null, user);
        } catch (err) {
          console.error("❌ Passport Google Strategy error:", err);
          return done(err, null);
        }
      }
    )
  );

  // ✅ Always store MongoDB ObjectId string
  passport.serializeUser((user, done) => {
    console.log("🔑 serializeUser ->", user._id.toString());
    done(null, user._id.toString());
  });

  // ✅ Load fresh user from DB
  passport.deserializeUser(async (id, done) => {
    console.log("🔑 deserializeUser id from session:", id);
    try {
      const user = await User.findById(id);
      if (!user) {
        console.warn("⚠️ No user found for id:", id);
        return done(null, null);
      }
      console.log("👤 Loaded user:", user.email);
      done(null, user);
    } catch (err) {
      console.error("❌ deserialize error", err);
      done(err, null);
    }
  });
}
