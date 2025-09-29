import express from "express";
import upload from "../../utils/upload.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductsByCategory,
  getProductById
} from "../../controllers/productController.js";

const router = express.Router();

router.post("/", upload.array("images"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/category/:id", getProductsByCategory);  // ✅ নতুন রুট
router.put("/:id", upload.array("images"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
