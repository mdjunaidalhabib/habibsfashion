import Product from "../src/models/Product.js";
import cloudinary from "../utils/cloudinary.js";

// ✅ Helper: upload multiple files to Cloudinary
const uploadFiles = async (files, folder) => {
  let urls = [];
  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.path, { folder });
    urls.push(result.secure_url);
  }
  return urls;
};

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    let imageUrls = [];
    let colors = [];

    // Main product images
    if (req.files && req.files.length > 0) {
      // শুধু "images" ফিল্ডের ফাইলগুলো filter করে নিলাম
      const productImages = req.files.filter((f) => f.fieldname === "images");
      if (productImages.length > 0) {
        imageUrls = await uploadFiles(productImages, "products");
      }
    }

    // Colors
    if (req.body.colors) {
      const parsedColors = [];
      const colorsData = Array.isArray(req.body.colors)
        ? req.body.colors
        : [req.body.colors];

      colorsData.forEach((c, idx) => {
        const name = req.body[`colors[${idx}][name]`];
        const colorFiles = req.files.filter(
          (f) => f.fieldname === `colors[${idx}][images]`
        );
        parsedColors.push({ name, images: [] });
        if (colorFiles.length > 0) {
          parsedColors[parsedColors.length - 1].images = [];
          colorFiles.forEach(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products/colors",
            });
            parsedColors[parsedColors.length - 1].images.push(result.secure_url);
          });
        }
      });
      colors = parsedColors;
    }

    // Reviews
    let reviews = [];
    if (req.body.reviews) {
      const reviewsData = Array.isArray(req.body.reviews)
        ? req.body.reviews
        : [req.body.reviews];

      reviewsData.forEach((r, idx) => {
        reviews.push({
          user: req.body[`reviews[${idx}][user]`],
          rating: req.body[`reviews[${idx}][rating]`],
          comment: req.body[`reviews[${idx}][comment]`],
        });
      });
    }

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      stock: req.body.stock,
      rating: req.body.rating,
      description: req.body.description,
      additionalInfo: req.body.additionalInfo,
      category: req.body.category,
      images: imageUrls,
      colors,
      reviews,
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    // Replace product images if new uploaded
    if (req.files && req.files.length > 0) {
      const productImages = req.files.filter((f) => f.fieldname === "images");
      if (productImages.length > 0) {
        // পুরানো images delete
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            const publicId = img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy("products/" + publicId);
          }
        }
        product.images = await uploadFiles(productImages, "products");
      }
    }

    // Update colors
    if (req.body.colors) {
      const updatedColors = [];
      const colorsData = Array.isArray(req.body.colors)
        ? req.body.colors
        : [req.body.colors];

      colorsData.forEach((c, idx) => {
        const name = req.body[`colors[${idx}][name]`];
        const colorFiles = req.files.filter(
          (f) => f.fieldname === `colors[${idx}][images]`
        );

        let colorObj = { name, images: [] };

        if (colorFiles.length > 0) {
          colorFiles.forEach(async (file) => {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "products/colors",
            });
            colorObj.images.push(result.secure_url);
          });
        }

        updatedColors.push(colorObj);
      });
      product.colors = updatedColors;
    }

    // Update reviews
    if (req.body.reviews) {
      const reviews = [];
      const reviewsData = Array.isArray(req.body.reviews)
        ? req.body.reviews
        : [req.body.reviews];

      reviewsData.forEach((r, idx) => {
        reviews.push({
          user: req.body[`reviews[${idx}][user]`],
          rating: req.body[`reviews[${idx}][rating]`],
          comment: req.body[`reviews[${idx}][comment]`],
        });
      });
      product.reviews = reviews;
    }

    // Other fields
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.oldPrice = req.body.oldPrice || product.oldPrice;
    product.stock = req.body.stock || product.stock;
    product.rating = req.body.rating || product.rating;
    product.description = req.body.description || product.description;
    product.additionalInfo =
      req.body.additionalInfo || product.additionalInfo;
    product.category = req.body.category || product.category;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name image");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✅ Get single product
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

// ✅ Get products by category
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
