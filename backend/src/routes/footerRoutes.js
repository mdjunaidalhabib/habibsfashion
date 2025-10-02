// src/routes/footerRoutes.js
import express from "express";
import Footer from "../models/Footer.js"; // ✅ .js extension

const router = express.Router();

// GET footer (public)
router.get("/", async (req, res) => {
  try {
    const footer = await Footer.findOne();
    res.json(footer || {});  // data না থাকলে খালি object ফেরত
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST create (public for now)
router.post("/", async (req, res) => {
  try {
    const created = await Footer.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update (public for now)
router.put("/", async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) {
      footer = await Footer.create(req.body);
    } else {
      Object.assign(footer, req.body);
      footer.updatedAt = new Date();
      await footer.save();
    }
    res.json(footer);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE (public for now)
router.delete("/", async (req, res) => {
  try {
    await Footer.deleteMany({});
    res.json({ message: "Deleted footer" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Default export for ESM
export default router;
