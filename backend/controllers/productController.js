import Product from "../src/models/Product.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import { deleteFromCloudinary } from "../utils/cloudinaryHelpers.js";

// =================== CREATE PRODUCT ===================
export const createProduct = async (req, res) => {
  try {
    const { name, price, oldPrice, stock, rating, description, additionalInfo, category } = req.body;
    if (!name || !price || !category) return res.status(400).json({ error: "Name, Price & Category required" });

    let primaryImage = "";
    let galleryImages = [];
    let colors = [];
    let reviews = [];

    // ---- Primary Image ----
    if (req.files?.image?.[0]) {
      const uploaded = await cloudinary.uploader.upload(req.files.image[0].path, { folder: "products" });
      fs.unlinkSync(req.files.image[0].path);
      primaryImage = uploaded.secure_url;
    }

    // ---- Gallery Images ----
    if (req.files?.images) {
      for (let file of req.files.images) {
        const uploaded = await cloudinary.uploader.upload(file.path, { folder: "products/gallery" });
        fs.unlinkSync(file.path);
        galleryImages.push(uploaded.secure_url);
      }
    }

    // ---- Colors ----
    if (req.body.colors) {
      const parsedColors = Array.isArray(req.body.colors) ? req.body.colors : JSON.parse(req.body.colors);
      for (let idx = 0; idx < parsedColors.length; idx++) {
        let color = parsedColors[idx];
        let colorImages = [];
        if (req.files[`colors[${idx}][images]`]) {
          for (let file of req.files[`colors[${idx}][images]`]) {
            const uploaded = await cloudinary.uploader.upload(file.path, { folder: `products/colors/${color.name}` });
            fs.unlinkSync(file.path);
            colorImages.push(uploaded.secure_url);
          }
        }
        colors.push({ name: color.name, images: colorImages });
      }
    }

    // ---- Reviews ----
    if (req.body.reviews) {
      reviews = Array.isArray(req.body.reviews) ? req.body.reviews : JSON.parse(req.body.reviews);
    }

    const product = new Product({
      name,
      price,
      oldPrice,
      stock,
      rating,
      description,
      additionalInfo,
      category,
      image: primaryImage,
      images: galleryImages,
      colors,
      reviews,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// =================== UPDATE PRODUCT ===================
export const updateProduct = async (req, res) => {
  try {
    const { name, price, oldPrice, stock, rating, description, additionalInfo, category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // ---- Primary Image ----
    if (req.files?.image?.[0]) {
      await deleteFromCloudinary(product.image);
      const uploaded = await cloudinary.uploader.upload(req.files.image[0].path, { folder: "products" });
      product.image = uploaded.secure_url;
      fs.unlinkSync(req.files.image[0].path);
    }

    // ---- Gallery Images ----
    if (req.files?.images) {
      for (let url of product.images || []) await deleteFromCloudinary(url);
      let newGallery = [];
      for (let file of req.files.images) {
        const uploaded = await cloudinary.uploader.upload(file.path, { folder: "products/gallery" });
        newGallery.push(uploaded.secure_url);
        fs.unlinkSync(file.path);
      }
      product.images = newGallery.length > 0 ? newGallery : product.images;
    }

    // ---- Colors ----
    if (req.body.colors) {
      const parsedColors = Array.isArray(req.body.colors) ? req.body.colors : JSON.parse(req.body.colors);
      let newColors = [];
      for (let idx = 0; idx < parsedColors.length; idx++) {
        let color = parsedColors[idx];
        let colorImages = [];
        if (req.files[`colors[${idx}][images]`]) {
          const existing = product.colors.find((c) => c.name === color.name);
          if (existing) for (let url of existing.images) await deleteFromCloudinary(url);

          for (let file of req.files[`colors[${idx}][images]`]) {
            const uploaded = await cloudinary.uploader.upload(file.path, { folder: `products/colors/${color.name}` });
            colorImages.push(uploaded.secure_url);
            fs.unlinkSync(file.path);
          }
        } else {
          const existing = product.colors.find((c) => c.name === color.name);
          if (existing) colorImages = existing.images;
        }
        newColors.push({ name: color.name, images: colorImages });
      }
      product.colors = newColors;
    }

    // ---- Reviews ----
    if (req.body.reviews) {
      product.reviews = Array.isArray(req.body.reviews) ? req.body.reviews : JSON.parse(req.body.reviews);
    }

    // ---- Other fields ----
    product.name = name || product.name;
    product.price = price || product.price;
    product.oldPrice = oldPrice || product.oldPrice;
    product.stock = stock || product.stock;
    product.rating = rating || product.rating;
    product.description = description || product.description;
    product.additionalInfo = additionalInfo || product.additionalInfo;
    product.category = category || product.category;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// =================== DELETE PRODUCT ===================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await deleteFromCloudinary(product.image);
    for (let url of product.images || []) await deleteFromCloudinary(url);
    for (let c of product.colors || []) for (let url of c.images) await deleteFromCloudinary(url);

    await product.deleteOne();
    res.json({ message: "🗑️ Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// =================== GET PRODUCTS ===================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// =================== GET SINGLE PRODUCT ===================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// =================== GET PRODUCTS BY CATEGORY ===================
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
