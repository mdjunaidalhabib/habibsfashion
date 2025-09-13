import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ সব প্রোডাক্ট আনবে
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ একক প্রোডাক্ট (id দিয়ে)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
