import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
});

export default mongoose.model("Category", categorySchema);
