import mongoose from "mongoose";

export const dbConnect = async (mongoUri) => {
  try {
    if (!mongoUri) {
      throw new Error("❌ Mongo URI not found in env file");
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("🔥 MongoDB Connection Error:", err);
    process.exit(1);
  }
};
