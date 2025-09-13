import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: String,
  rating: Number,
  comment: String,
});

const colorSchema = new mongoose.Schema({
  name: String,
  images: [String],
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  oldPrice: Number,
  image: String,
  rating: Number,
  category: String,
  description: String,
  additionalInfo: String,
  reviews: [reviewSchema],
  images: [String],
  colors: [colorSchema],
});

export default mongoose.model("Product", productSchema);
