import generateToken from "../utils/generateToken.js";
import Admin from "../models/Admin.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      const token = generateToken(admin);

      // 🌍 Cookie options for both localhost and live server
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "none",
        domain: ".habibsfashion.com",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
