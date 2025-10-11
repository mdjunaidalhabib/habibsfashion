"use client";
import { useEffect, useState, useRef } from "react";

export default function ProductForm({ product, onClose, onSaved }) {
  const [categories, setCategories] = useState([]);
  const colorOptions = ["Red", "Blue", "Black", "White", "Green", "Yellow"];

  const [form, setForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    stock: 0,
    rating: 0,
    description: "",
    additionalInfo: "",
    category: "",
    image: null,
    images: [],
    colors: [],
    reviews: [],
  });

  const [previewImage, setPreviewImage] = useState("");
  const [processing, setProcessing] = useState(false); // ✅ saving/updating state
  const objectUrls = useRef([]);

  useEffect(() => {
    loadCategories();

    if (product) {
      setForm({
        name: product.name || "",
        price: product.price || "",
        oldPrice: product.oldPrice || "",
        stock: product.stock || 0,
        rating: product.rating || 0,
        description: product.description || "",
        additionalInfo: product.additionalInfo || "",
        category: product.category?._id || "",
        image: null,
        images: product.images || [],
        colors: product.colors || [],
        reviews: product.reviews || [],
      });
      setPreviewImage(product.image || "");
    }

    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [product]);

  const loadCategories = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories");
    setCategories(await res.json());
  };

  const getImageSrc = (img) => {
    if (!img) return "";
    if (typeof img === "string") return img;
    const url = URL.createObjectURL(img);
    objectUrls.current.push(url);
    return url;
  };

  const handleSingleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      setForm({ ...form, image: file });
      setPreviewImage(url);
    }
  };

  const handleGalleryFiles = (files) => {
    const imgFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imgFiles.length) setForm({ ...form, images: [...form.images, ...imgFiles] });
  };

  const removeGalleryImage = (idx) => {
    const newImgs = form.images.filter((_, i) => i !== idx);
    setForm({ ...form, images: newImgs });
  };

  const addColor = () => {
    setForm({ ...form, colors: [...form.colors, { name: "Red", images: [] }] });
  };

  const handleColorSelect = (idx, value) => {
    const newColors = [...form.colors];
    newColors[idx].name = value;
    setForm({ ...form, colors: newColors });
  };

  const removeColorImage = (cIdx, imgIdx) => {
    const newColors = [...form.colors];
    newColors[cIdx].images = newColors[cIdx].images.filter((_, i) => i !== imgIdx);
    setForm({ ...form, colors: newColors });
  };

  const addReview = () => {
    setForm({ ...form, reviews: [...form.reviews, { user: "", rating: 0, comment: "" }] });
  };

  const handleReviewChange = (idx, field, value) => {
    const newReviews = [...form.reviews];
    newReviews[idx][field] = value;
    setForm({ ...form, reviews: newReviews });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      return alert("⚠️ Name, Price & Category required!");
    }

    setProcessing(true); // ✅ start saving/updating

    try {
      const data = new FormData();
      for (let key in form) {
        if (["image", "images", "colors", "reviews"].includes(key)) continue;
        data.append(key, form[key]);
      }
      if (form.image) data.append("image", form.image);
      form.images.forEach((img) => data.append("images", img));
      form.colors.forEach((color, idx) => {
        data.append(`colors[${idx}][name]`, color.name);
        color.images.forEach((img) => data.append(`colors[${idx}][images]`, img));
      });
      form.reviews.forEach((r, idx) => {
        data.append(`reviews[${idx}][user]`, r.user);
        data.append(`reviews[${idx}][rating]`, r.rating);
        data.append(`reviews[${idx}][comment]`, r.comment);
      });

      const url = product
        ? process.env.NEXT_PUBLIC_API_URL + "/api/products/" + product._id
        : process.env.NEXT_PUBLIC_API_URL + "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        alert(product ? "✅ Product Updated!" : "✅ Product Saved!");
        onSaved();
      } else {
        alert("❌ Error saving product");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong!");
    } finally {
      setProcessing(false); // ✅ end saving/updating
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100"
    >
      <h1 className="text-xl font-bold mb-2">{product ? "✏ Edit Product" : "➕ Add Product"}</h1>

      {/* Name & Price */}
      <input
        className="w-full border p-2 rounded-lg"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          className="border p-2 rounded-lg"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="number"
          className="border p-2 rounded-lg"
          placeholder="Old Price"
          value={form.oldPrice}
          onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
        />
      </div>

      {/* Stock & Rating */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          className="border p-2 rounded-lg"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <input
          type="number"
          min="0"
          max="5"
          className="border p-2 rounded-lg"
          placeholder="Rating (0–5)"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
        />
      </div>

      {/* Description */}
      <textarea
        className="w-full border p-2 rounded-lg"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <textarea
        className="w-full border p-2 rounded-lg"
        placeholder="Additional Info"
        value={form.additionalInfo}
        onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
      />

      {/* Category */}
      <select
        className="w-full border p-2 rounded-lg"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        <option value="">-- Select Category --</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      {/* Primary Image */}
      <div>
        <label className="font-semibold block mb-1">Primary Image</label>
        <input
          type="file"
          onChange={handleSingleImage}
          className="w-full border p-2 rounded-lg"
        />
        {previewImage && (
          <img src={previewImage} className="h-20 mt-2 rounded-lg shadow object-cover" />
        )}
      </div>

      {/* Gallery */}
      <div
        onDrop={(e) => { e.preventDefault(); handleGalleryFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer hover:border-indigo-500 transition"
      >
        Drag & Drop Gallery Images Here or Click to Select
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleGalleryFiles(e.target.files)}
          ref={(el) => { if (el) el.parentElement.onclick = () => el.click(); }}
        />
      </div>

      {/* Gallery Preview */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {form.images.map((img, idx) => (
          <div key={idx} className="relative group">
            <img src={getImageSrc(img)} alt={`gallery-${idx}`} className="h-20 w-full object-cover rounded-lg shadow-md border" />
            <button
              type="button"
              onClick={() => removeGalleryImage(idx)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition"
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      {/* Save / Update Buttons */}
      <button
        type="submit"
        disabled={processing}
        className={`w-full py-3 rounded-lg text-white font-semibold shadow hover:scale-105 transition ${
          processing ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"
        }`}
      >
        {processing ? (product ? "Updating..." : "Saving...") : product ? "💾 Update Product" : "💾 Save Product"}
      </button>

      <button
        type="button"
        onClick={onClose}
        disabled={processing}
        className={`mt-2 w-full py-2 rounded-lg text-black font-medium ${
          processing ? "bg-gray-200 cursor-not-allowed" : "bg-gray-300"
        }`}
      >
        ✖ Cancel
      </button>
    </form>
  );
}
