import express from "express";
import {
  getProducts,
  getProductById,
  getProductsByCategory,
} from "../../../controllers/productController.js";

const router = express.Router();

// 📦 সব পণ্য লোড
router.get("/", getProducts);

// 📂 ক্যাটাগরি অনুযায়ী পণ্য
router.get("/category/:categoryId", getProductsByCategory);

// 🔍 নির্দিষ্ট পণ্য
router.get("/:id", getProductById);

export default router;
