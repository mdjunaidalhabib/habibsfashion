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

// ✅ Render/Vercel এর proxy trust করতে হবে
app.set("trust proxy", 1);

// ✅ Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : ["http://localhost:3000"],
    credentials: true, // ✅ cookie পাঠানোর জন্য
  })
);
app.use(express.json());

// ✅ Session setup
const isProd = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    proxy: true, // proxy-aware cookie
    cookie: {
      httpOnly: true,
      secure: isProd, // production এ অবশ্যই true
      sameSite: isProd ? "none" : "lax", // cross-site cookie allow
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ✅ Passport setup
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

// ✅ Serve uploads (images)
app.use("/uploads", express.static("uploads"));

// ✅ Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "✅ API is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Start server
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
