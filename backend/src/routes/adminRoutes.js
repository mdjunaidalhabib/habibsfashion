import express from "express";
import Admin from "../models/Admin.js";
import generateToken from "../../utils/generateToken.js";
import { protect, superAdminOnly } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

/* 🟢 LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      const token = generateToken(admin);

      // ✅ কুকি সেট করা
      res.cookie("admin_token", token, {
        httpOnly: true,
        sameSite: "none", // ⚠️ CORS সহ কাজ করার জন্য
        secure: process.env.NODE_ENV === "production", // HTTPS হলে true
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // ৭ দিন
      });

      return res.status(200).json({
        message: "✅ Login successful",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } else {
      return res.status(401).json({ message: "❌ Invalid email or password" });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* 🔴 LOGOUT */
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      sameSite: "none", // ✅ important for cross-site cookies
      secure: process.env.NODE_ENV === "production", // ✅ https হলে true
      path: "/", // ✅ অবশ্যই লাগবে
    });

    console.log("🧹 Cookie cleared successfully");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/* 🟣 REGISTER (Super Admin only) */
router.post("/register", protect, superAdminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await Admin.findOne({ email });

    if (exists)
      return res.status(400).json({ message: "❌ Admin already exists" });

    const newAdmin = await Admin.create({ name, email, password, role });

    res.status(201).json({
      message: "✅ New admin created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* 🟩 VERIFY (Middleware check test route) */
router.get("/verify", protect, async (req, res) => {
  try {
    res.json({
      message: "✅ Auth verified",
      admin: req.admin,
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
