import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Product from "../models/Product.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ সব products আনবে
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ নতুন product add
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      price,
      oldPrice,
      rating,
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

// ✅ update product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    if (req.body.reviews) updateData.reviews = JSON.parse(req.body.reviews);
    if (req.body.images) updateData.images = JSON.parse(req.body.images);
    if (req.body.colors) updateData.colors = JSON.parse(req.body.colors);

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("category", "name");

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "Failed to update product", details: err.message });
  }
});

// ✅ delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
