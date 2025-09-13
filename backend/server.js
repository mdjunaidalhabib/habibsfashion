import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { dbConnect } from "./src/lib/db.js";
import { configurePassport } from "./src/auth/passport.js";
import authRoutes from "./src/routes/auth.js";
import locationRoutes from "./src/routes/locationRoutes.js";
import orderRoutes from "./src/routes/order.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";

dotenv.config();
const app = express();

// ✅ Connect DB
await dbConnect(process.env.MONGO_URI);

// ✅ Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL.split(","), // একাধিক URL সাপোর্ট
    credentials: true,
  })
);

app.use(express.json());

// ✅ Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // লোকালে false, production এ true
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 দিন
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
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({ message: "✅ API is running" });
});

// ✅ Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
