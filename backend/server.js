import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import helmet from "helmet";

import dbConnect from "./src/lib/db.js";
import { configurePassport } from "./src/auth/passport.js";
import authRoutes from "./src/routes/auth.js";
import locationRoutes from "./src/routes/locationRoutes.js";
import ordersRoute from "./src/routes/orders.js";
import categoriesRoute from "./src/routes/categories.js";
import productsRoute from "./src/routes/products.js";
import usersRoute from "./src/routes/users.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";

// ✅ Env check
if (!process.env.MONGO_URI) {
  console.error("❌ Missing MONGO_URI");
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  console.error("❌ Missing SESSION_SECRET");
  process.exit(1);
}

// ✅ Proxy trust (Heroku/Vercel/Nginx)
app.set("trust proxy", 1);

// ✅ Helmet
app.use(
  helmet({
    contentSecurityPolicy: isProd ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ✅ CORS
const rawOrigins =
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:3000,http://localhost:3001";

const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow Postman / curl
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  })
);

// ✅ JSON
app.use(express.json());

// ✅ Session
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
app.use(
  session({
    name: "sid", // 👈 Cookie name fixed
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7,
      autoRemove: "native",
    }),
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ✅ Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/products", productsRoute);
app.use("/api/users", usersRoute);

// ✅ Static files
app.use("/uploads", express.static("uploads"));

// ✅ Health
app.get(["/health", "/"], (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ API is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Uncaught error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", details: isProd ? undefined : String(err) });
});

// ✅ Start
const startServer = async () => {
  try {
    await dbConnect(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to connect DB:", err);
    process.exit(1);
  }
};
startServer();

export default app;
