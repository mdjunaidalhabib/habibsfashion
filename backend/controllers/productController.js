import Product from "../src/models/Product.js";
import cloudinary from "../utils/cloudinary.js";

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    let imageUrls = [];

    // multiple images upload
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const product = new Product({
      ...req.body,
      images: imageUrls,
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    // নতুন images থাকলে পুরানোগুলো ডিলিট করে replace করব
    if (req.files && req.files.length > 0) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          const publicId = img.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy("products/" + publicId);
        }
      }

      let imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        imageUrls.push(result.secure_url);
      }
      product.images = imageUrls;
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    // পুরানো images delete
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        const publicId = img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy("products/" + publicId);
      }
    }

    await product.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get All Products (Category সহ populate)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name image");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✅ Get Single Product (Category সহ populate)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name image"
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// ✅ Get Products by Category
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id }).populate(
      "category",
      "name image"
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};
