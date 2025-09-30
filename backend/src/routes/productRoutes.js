import express from "express";
import upload from "../../utils/upload.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getProductsByCategory, // ✅ Import the new controller
} from "../../controllers/productController.js";

const router = express.Router();

// Dynamic Multer fields config
const colorFields = Array.from({ length: 20 }).map((_, i) => ({
  name: `colors[${i}][images]`,
}));
const productUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images" },
  ...colorFields,
]);

// ------------------- Routes -------------------

// Create product
router.post("/", productUpload, createProduct);

// Update product
router.put("/:id", productUpload, updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

// Get all products
router.get("/", getProducts);

// Get products by category ✅
router.get("/category/:categoryId", getProductsByCategory);

// Get single product
router.get("/:id", getProductById);

export default router;
