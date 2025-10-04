import express from "express";
import Footer from "../models/Footer.js";
import upload from "../../utils/upload.js"; // multer middleware
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";

const router = express.Router();

// GET footer
router.get("/", async (req, res) => {
  try {
    const footer = await Footer.findOne();
    res.json(footer || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST footer + optional logo
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const data = req.body;

    // JSON parse brand/contact if sent as string
    if (data.brand && typeof data.brand === "string") data.brand = JSON.parse(data.brand);
    if (data.contact && typeof data.contact === "string") data.contact = JSON.parse(data.contact);

    // Upload logo if exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "brand_logos" });
      fs.unlinkSync(req.file.path);
      data.brand = data.brand || {};
      data.brand.logo = result.secure_url;
    }

    // Update or create footer
    let footer = await Footer.findOne();
    if (!footer) {
      footer = await Footer.create(data);
    } else {
      Object.assign(footer, data);
      footer.updatedAt = new Date();
      await footer.save();
    }

    res.json({ message: "Footer updated successfully", footer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE footer
router.delete("/", async (req, res) => {
  try {
    await Footer.deleteMany({});
    res.json({ message: "Deleted footer" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
