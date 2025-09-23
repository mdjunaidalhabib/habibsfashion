import mongoose from "mongoose";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    userId: { type: Number, unique: true }, // ✅ auto incremented ID
    name: String,
    email: { type: String, required: true, unique: true },

    // ✅ Avatar field with default image
    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?u=default"
    },
  },
  { timestamps: true }
);

// ✅ Pre-save hook to auto-increment userId
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
