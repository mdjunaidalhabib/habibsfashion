import express from "express";
import Footer from "../../models/Footer.js";

const router = express.Router();

// ✅ GET Footer (Public)
// FINAL path: GET /api/v1/footer
router.get("/", async (req, res) => {
  try {
    const footer = await Footer.findOne();
    res.json(footer || {});
  } catch (err) {
    console.error("❌ Error fetching footer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
