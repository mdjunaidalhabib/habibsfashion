import express from "express";
import upload from "../../utils/upload.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
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

router.post("/", productUpload, createProduct);
router.put("/:id", productUpload, updateProduct);
router.delete("/:id", deleteProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
