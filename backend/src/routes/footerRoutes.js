import express from "express";
import Footer from "../models/Footer.js";
import upload from "../../utils/upload.js"; // multer middleware
import { deleteFromCloudinary } from "../../utils/cloudinaryHelpers.js";
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";

const router = express.Router();

// GET Footer
router.get("/", async (req, res) => {
  try {
    const footer = await Footer.findOne();
    res.json(footer || {});
  } catch (err) {
    console.error("❌ Error fetching footer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST Footer + optional logo
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    let data = { ...req.body };

    // Parse brand/contact JSON if sent as string
    if (data.brand && typeof data.brand === "string") data.brand = JSON.parse(data.brand);
    if (data.contact && typeof data.contact === "string") data.contact = JSON.parse(data.contact);

    // Upload logo if exists
    const footer = await Footer.findOne();
    if (req.file) {
      if (footer?.brand?.logo) await deleteFromCloudinary(footer.brand.logo);

      const result = await cloudinary.uploader.upload(req.file.path, { folder: "brand_logos" });
      fs.unlinkSync(req.file.path);
      data.brand = data.brand || {};
      data.brand.logo = result.secure_url;
    }

    // Update or create
    let updatedFooter;
    if (!footer) {
      updatedFooter = await Footer.create(data);
    } else {
      Object.assign(footer, data);
      footer.updatedAt = new Date();
      updatedFooter = await footer.save();
    }

    res.json({ message: "✅ Footer updated successfully", footer: updatedFooter });
  } catch (err) {
    console.error("❌ Error updating footer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE Footer
router.delete("/", async (req, res) => {
  try {
    const footer = await Footer.findOne();
    if (footer?.brand?.logo) await deleteFromCloudinary(footer.brand.logo);

    await Footer.deleteMany({});
    res.json({ message: "🗑️ Footer deleted" });
  } catch (err) {
    console.error("❌ Error deleting footer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
