import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ সব ক্যাটাগরি আনো
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ নির্দিষ্ট ক্যাটাগরির ডিটেইলস আনো
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("❌ Error fetching category:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ নির্দিষ্ট ক্যাটাগরির products আনো
router.get("/:id/products", async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const products = await Product.find({ category: req.params.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
