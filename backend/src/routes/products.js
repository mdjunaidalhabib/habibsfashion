import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Product from "../models/Product.js";

const router = express.Router();

// =========================
// Multer config
// =========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// =========================
// Helper: calculate rating
// =========================
function calculateRating(reviews = []) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  return parseFloat((total / reviews.length).toFixed(1));
}

// =========================
// Routes
// =========================

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});

// GET products by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId }).populate("category", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products by category", details: err.message });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product", details: err.message });
  }
});

// POST new product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      price,
      oldPrice,
      description,
      additionalInfo,
      stock,
      category,
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    let reviews = [];
    if (req.body.reviews) reviews = JSON.parse(req.body.reviews);

    let images = [];
    if (req.body.images) images = JSON.parse(req.body.images);

    let colors = [];
    if (req.body.colors) colors = JSON.parse(req.body.colors);

    // ✅ Auto calculate rating from reviews
    const rating = calculateRating(reviews);

    const product = new Product({
      name,
      price,
      oldPrice,
      image,
      rating,
      description,
      additionalInfo,
      stock,
      category,
      reviews,
      images,
      colors,
    });

    await product.save();
    const savedProduct = await Product.findById(product._id).populate("category", "name");

    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: "Failed to create product", details: err.message });
  }
});

// PUT update product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    if (req.body.reviews) updateData.reviews = JSON.parse(req.body.reviews);
    if (req.body.images) updateData.images = JSON.parse(req.body.images);
    if (req.body.colors) updateData.colors = JSON.parse(req.body.colors);

    // ✅ Auto calculate rating from updated reviews
    updateData.rating = calculateRating(updateData.reviews || []);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("category", "name");

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "Failed to update product", details: err.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
});

export default router;
