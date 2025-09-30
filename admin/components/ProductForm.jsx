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

  // For cleanup (memory leak fix)
  const objectUrls = useRef([]);

  useEffect(() => {
    loadCategories();

    // Prefill form if editing
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
        images: product.images || [], // keep existing gallery
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

  // Helper to safely get image src
  const getImageSrc = (img) => {
    if (!img) return "";
    if (typeof img === "string") return img; // already a URL
    const url = URL.createObjectURL(img); // File/Blob
    objectUrls.current.push(url);
    return url;
  };

  // Primary Image
  const handleSingleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      setForm({ ...form, image: file });
      setPreviewImage(url);
    }
  };

  // Gallery
  const removeGalleryImage = (idx) => {
    const newImgs = form.images.filter((_, i) => i !== idx);
    setForm({ ...form, images: newImgs });
  };

  // Colors
  const addColor = () => {
    setForm({
      ...form,
      colors: [...form.colors, { name: "Red", images: [] }],
    });
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

  // Reviews
  const addReview = () => {
    setForm({
      ...form,
      reviews: [...form.reviews, { user: "", rating: 0, comment: "" }],
    });
  };
  const handleReviewChange = (idx, field, value) => {
    const newReviews = [...form.reviews];
    newReviews[idx][field] = value;
    setForm({ ...form, reviews: newReviews });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      return alert("⚠️ Name, Price & Category required!");
    }

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
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100"
    >
      <h1 className="text-xl font-bold mb-2">
        {product ? "✏ Edit Product" : "➕ Add Product"}
      </h1>

      {/* Basic Info */}
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
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
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
          <img
            src={previewImage}
            className="h-20 mt-2 rounded-lg shadow object-cover"
          />
        )}
      </div>

      {/* Gallery Images */}
      <label className="font-semibold block mb-2">Gallery Images</label>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {form.images.map((img, idx) => (
          <div key={idx} className="relative group">
            <img
              src={getImageSrc(img)}
              alt={`gallery-${idx}`}
              className="h-20 w-full object-cover rounded-lg shadow-md border"
            />
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

      <div className="flex gap-2">
        {form.images.length === 0 && (
          <button
            type="button"
            onClick={() => document.getElementById("galleryChooser").click()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
          >
            📂 Choose Image
          </button>
        )}
        {form.images.length > 0 && (
          <button
            type="button"
            onClick={() => document.getElementById("galleryAddMore").click()}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
          >
            ➕ আরও যোগ করুন
          </button>
        )}
      </div>
      <input
        id="galleryChooser"
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) {
            setForm({ ...form, images: [e.target.files[0]] });
          }
        }}
      />
      <input
        id="galleryAddMore"
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) {
            setForm({ ...form, images: [...form.images, e.target.files[0]] });
          }
        }}
      />

      {/* Colors */}
      <label className="font-semibold block mb-2">Colors</label>
      {form.colors.map((color, idx) => (
        <div key={idx} className="border rounded-lg p-3 mb-4 bg-gray-50">
          <select
            value={color.name}
            onChange={(e) => handleColorSelect(idx, e.target.value)}
            className="border p-2 rounded-lg w-full mb-2"
          >
            {colorOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {color.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {color.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={getImageSrc(img)}
                    alt={`color-${idx}-${i}`}
                    className="h-16 w-full object-cover rounded-lg shadow"
                  />
                  <button
                    type="button"
                    onClick={() => removeColorImage(idx, i)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {color.name && color.images.length === 0 && (
              <button
                type="button"
                onClick={() =>
                  document.getElementById(`colorChooser-${idx}`).click()
                }
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
              >
                📂 Choose Image
              </button>
            )}
            {color.name && color.images.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  document.getElementById(`colorAddMore-${idx}`).click()
                }
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
              >
                ➕ আরও যোগ করুন
              </button>
            )}
          </div>

          <input
            id={`colorChooser-${idx}`}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) {
                const newColors = [...form.colors];
                newColors[idx].images = [e.target.files[0]];
                setForm({ ...form, colors: newColors });
              }
            }}
          />
          <input
            id={`colorAddMore-${idx}`}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files[0]) {
                const newColors = [...form.colors];
                newColors[idx].images = [
                  ...newColors[idx].images,
                  e.target.files[0],
                ];
                setForm({ ...form, colors: newColors });
              }
            }}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addColor}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow"
      >
        + Add Color
      </button>

      {/* Reviews */}
      <div>
        <label className="font-semibold">Reviews</label>
        {form.reviews.map((r, idx) => (
          <div key={idx} className="border p-3 mb-2 rounded-lg bg-gray-50">
            <input
              type="text"
              className="border p-2 w-full mb-2 rounded"
              placeholder="User"
              value={r.user}
              onChange={(e) => handleReviewChange(idx, "user", e.target.value)}
            />
            <input
              type="number"
              min="0"
              max="5"
              className="border p-2 w-full mb-2 rounded"
              placeholder="Rating (0–5)"
              value={r.rating}
              onChange={(e) =>
                handleReviewChange(idx, "rating", e.target.value)
              }
            />
            <textarea
              className="border p-2 w-full rounded"
              placeholder="Comment"
              value={r.comment}
              onChange={(e) =>
                handleReviewChange(idx, "comment", e.target.value)
              }
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addReview}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Review
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow hover:scale-105 transition"
      >
        💾 {product ? "Update Product" : "Save Product"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full py-2 rounded-lg bg-gray-300 text-black font-medium"
      >
        ✖ Cancel
      </button>
    </form>
  );
}
