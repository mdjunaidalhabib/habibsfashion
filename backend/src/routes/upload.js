// routes/upload.js
import express from "express";
import cloudinary from "../../utils/cloudinary.js"; // তোমার cloudinary config path
import upload from "../../utils/upload.js"; // multer middleware path
import fs from "fs";

const router = express.Router();

router.post("/logo", upload.single("logo"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "brand_logos",
    });

    // লোকাল ফাইল মুছে ফেলবো
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
