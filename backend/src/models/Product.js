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
  name: { type: String, required: true },
  price: Number,
  oldPrice: Number,
  image: String,
  rating: Number,
  description: String,
  additionalInfo: String,
  reviews: [reviewSchema],
  images: [String],
  colors: [colorSchema],

  // 🔗 Category Relation
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
