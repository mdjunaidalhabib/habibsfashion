import express from "express";
import Navbar from "../models/Navbar.js";
import upload from "../../utils/upload.js"; // multer
import fs from "fs";
import { deleteFromCloudinary } from "../../utils/cloudinaryHelpers.js";
import cloudinary from "../../utils/cloudinary.js";

const router = express.Router();

// GET Navbar
router.get("/", async (req, res) => {
  try {
    const navbar = await Navbar.findOne();
    res.json(navbar || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST Navbar + optional logo upload
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    let data = {};

    // Parse brand JSON string
    if (req.body.brand) {
      try {
        data.brand = JSON.parse(req.body.brand);
      } catch {
        data.brand = {};
      }
    }

    let navbar = await Navbar.findOne();

    // Handle logo upload
    if (req.file) {
      // Delete old logo
      if (navbar?.brand?.logo) await deleteFromCloudinary(navbar.brand.logo);

      const result = await cloudinary.uploader.upload(req.file.path, { folder: "brand_logos" });
      fs.unlinkSync(req.file.path);

      data.brand = data.brand || {};
      data.brand.logo = result.secure_url;
    }

    if (!navbar) {
      navbar = await Navbar.create(data);
    } else {
      if (data.brand) {
        navbar.brand = { ...navbar.brand, ...data.brand };
      }
      navbar.updatedAt = new Date();
      await navbar.save();
    }

    res.json({ message: "✅ Navbar updated successfully", navbar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
