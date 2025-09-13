import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // counter name
  seq: { type: Number, default: 530 }, // starting point
});

export default mongoose.model("Counter", counterSchema);
