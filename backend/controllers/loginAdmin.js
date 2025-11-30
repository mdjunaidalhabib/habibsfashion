import generateToken from "../utils/generateToken.js";
import Admin from "../src/models/Admin.js";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔥 NEW loginAdmin running"); // ✅ test

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "❌ ভুল ইমেইল দেওয়া হয়েছে" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "🔒 ভুল পাসওয়ার্ড দেওয়া হয়েছে" });
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip;

    const uaString = req.headers["user-agent"] || "";
    const parser = new UAParser(uaString);
    const ua = parser.getResult();

    const deviceType =
      ua.device.type === "mobile"
        ? "Mobile"
        : ua.device.type === "tablet"
        ? "Tablet"
        : "PC";

    const osName = ua.os.name || "Unknown OS";
    const osVersion = ua.os.version || "";
    const browserName = ua.browser.name || "Unknown Browser";
    const browserVersion = ua.browser.version || "";

    const geo = geoip.lookup(ip);
    const location = geo
      ? {
          country: geo.country,
          city: geo.city,
          region: geo.region,
          lat: geo.ll?.[0],
          lon: geo.ll?.[1],
        }
      : null;

    // ✅ save
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ip;
    admin.lastLoginDevice = deviceType;
    admin.lastLoginOS = `${osName} ${osVersion}`.trim();
    admin.lastLoginBrowser = `${browserName} ${browserVersion}`.trim();
    admin.lastLoginUA = uaString;
    if (location) admin.lastLoginLocation = location;

    await admin.save();

    console.log("✅ Saved device:", deviceType);
    console.log("✅ Saved os:", admin.lastLoginOS);
    console.log("✅ Saved browser:", admin.lastLoginBrowser);
    console.log("✅ Saved ip:", ip);

    const token = generateToken(admin);

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: isProd ? process.env.COOKIE_DOMAIN : "localhost",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "✅ লগইন সফল হয়েছে!",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,

        lastLoginAt: admin.lastLoginAt,
        lastLoginIp: admin.lastLoginIp,
        lastLoginDevice: admin.lastLoginDevice,
        lastLoginOS: admin.lastLoginOS,
        lastLoginBrowser: admin.lastLoginBrowser,
        lastLoginLocation: admin.lastLoginLocation || null,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "⚠️ সার্ভারে কিছু সমস্যা হয়েছে" });
  }
};
