// routes/navbarRoutes.js
import express from "express";
import Navbar from "../models/Navbar.js";
import upload from "../../utils/upload.js"; // multer
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";

const router = express.Router();

// GET Navbar
router.get("/", async (req, res) => {
  try {
    const navbar = await Navbar.findOne();
    res.json(navbar || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST/PUT Navbar + optional logo upload
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const data = req.body;

    // যদি logo file আসে
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "brand_logos",
      });
      fs.unlinkSync(req.file.path);
      data.brand = data.brand || {};
      data.brand.logo = result.secure_url;
    }

    let navbar = await Navbar.findOne();
    if (!navbar) {
      navbar = await Navbar.create(data);
    } else {
      Object.assign(navbar, data);
      navbar.updatedAt = new Date();
      await navbar.save();
    }

    res.json({ message: "Navbar updated successfully", navbar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
