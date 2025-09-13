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
import order from "./src/routes/order.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";


dotenv.config();
const app = express();

// ✅ Connect DB
await dbConnect(process.env.MONGO_URI);

// ✅ Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: false, // লোকালে false রাখো, production এ true (HTTPS)
      sameSite: "lax", // যদি frontend+backend আলাদা port/domain হয়
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
app.use("/api/orders", order);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);




// ✅ Server start
app.listen(process.env.PORT || 4000, () =>
  console.log("✅ Backend running on " + (process.env.PORT || 4000))
);
