import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Category from "../models/Category.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // যদি uploads ফোল্ডার না থাকে তাহলে বানাবে
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * ✅ সব Category লিস্ট
 */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * ✅ নতুন Category add
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = new Category({ name, image });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to create category", details: err.message });
  }
});

/**
 * ✅ Category Update (PUT)
 */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    // নতুন ছবি থাকলে সেট, না থাকলে পুরনোটা রাখবে
    let updateData = { name };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: "Failed to update category", details: err.message });
  }
});

/**
 * ✅ Category Delete
 */
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
