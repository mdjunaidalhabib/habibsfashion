import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import helmet from "helmet";

import dbConnect from "./src/lib/db.js";
import { configurePassport } from "./src/auth/passport.js";
import authRoutes from "./src/routes/auth.js";
import locationRoutes from "./src/routes/locationRoutes.js";
import ordersRoute from "./src/routes/orders.js";
import usersRoute from "./src/routes/users.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";

// ✅ Proxy trust
app.set("trust proxy", 1);

// ✅ Helmet
app.use(
  helmet({
    contentSecurityPolicy: isProd ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ✅ Allowed origins from env (multiple URLs supported)
const rawOrigins =
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:3000,http://localhost:3001";

const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

// ✅ CORS middleware
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow Postman / curl / server-to-server
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`❌ CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  })
);

// ✅ JSON parser
app.use(express.json());

// ✅ Passport
configurePassport();
app.use(passport.initialize());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", usersRoute);

// ✅ Static files
app.use("/uploads", express.static("uploads"));

// ✅ Health check
app.get(["/health", "/"], (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ API is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Uncaught error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: isProd ? undefined : String(err),
  });
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
