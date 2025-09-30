"use client";
import { useEffect, useState } from "react";

function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button className="ml-4" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    stock: 0,
    rating: 0,
    description: "",
    additionalInfo: "",
    category: "",
    colors: [],
    reviews: [], // 🟢 review field add করা হলো
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  // load products + categories
  const loadProducts = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products");
    setProducts(await res.json());
  };
  const loadCategories = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/categories"
    );
    setCategories(await res.json());
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  // colors
  const addColor = () =>
    setForm({ ...form, colors: [...form.colors, { name: "", images: [] }] });
  const handleColorNameChange = (idx, value) => {
    const newColors = [...form.colors];
    newColors[idx].name = value;
    setForm({ ...form, colors: newColors });
  };
  const handleColorImages = (idx, files) => {
    const newColors = [...form.colors];
    newColors[idx].images = Array.from(files);
    setForm({ ...form, colors: newColors });
  };

  // reviews
  const addReview = () =>
    setForm({
      ...form,
      reviews: [...form.reviews, { user: "", rating: 0, comment: "" }],
    });
  const handleReviewChange = (idx, field, value) => {
    const newReviews = [...form.reviews];
    newReviews[idx][field] = value;
    setForm({ ...form, reviews: newReviews });
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    for (let key in form) {
      if (key !== "colors" && key !== "reviews") data.append(key, form[key]);
    }

    images.forEach((img) => data.append("images", img));

    // colors
    form.colors.forEach((color, idx) => {
      data.append(`colors[${idx}][name]`, color.name);
      color.images.forEach((img) => {
        data.append(`colors[${idx}][images]`, img);
      });
    });

    // reviews
    form.reviews.forEach((rev, idx) => {
      data.append(`reviews[${idx}][user]`, rev.user);
      data.append(`reviews[${idx}][rating]`, rev.rating);
      data.append(`reviews[${idx}][comment]`, rev.comment);
    });

    let url = process.env.NEXT_PUBLIC_API_URL + "/api/products";
    let method = "POST";
    if (editId) {
      url += "/" + editId;
      method = "PUT";
    }

    const res = await fetch(url, { method, body: data });
    if (res.ok) {
      setToast({
        message: editId ? "✅ Product updated!" : "✅ Product added!",
        type: "success",
      });
      resetForm();
      loadProducts();
    } else {
      setToast({ message: "❌ Error saving product", type: "error" });
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      oldPrice: "",
      stock: 0,
      rating: 0,
      description: "",
      additionalInfo: "",
      category: "",
      colors: [],
      reviews: [],
    });
    setImages([]);
    setPreview([]);
    setEditId(null);
    setShowModal(false);
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice || "",
      stock: p.stock,
      rating: p.rating || 0,
      description: p.description || "",
      additionalInfo: p.additionalInfo || "",
      category: p.category?._id || "",
      colors: p.colors || [],
      reviews: p.reviews || [],
    });
    setPreview(p.images || []);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/products/" + id,
      { method: "DELETE" }
    );
    if (res.ok) {
      setToast({ message: "🗑️ Product deleted!", type: "success" });
      loadProducts();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add
        </button>
      </div>

      {/* Product List */}
      <div className="grid md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p._id}
            className="border rounded shadow p-3 flex flex-col bg-white"
          >
            {p.images && p.images.length > 0 && (
              <img
                src={p.images[0]}
                alt={p.name}
                className="h-24 w-full object-cover rounded mb-2"
              />
            )}
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-gray-600">
              ৳ {p.price}{" "}
              {p.oldPrice && (
                <span className="line-through text-sm">৳ {p.oldPrice}</span>
              )}
            </p>
            <p className="text-sm text-gray-500">Stock: {p.stock}</p>
            <p className="text-sm text-gray-400">{p.category?.name}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded p-6 w-96 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editId ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="border p-2 mb-2 w-full"
              />
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                className="border p-2 mb-2 w-full"
              />
              <input
                name="oldPrice"
                type="number"
                value={form.oldPrice}
                onChange={handleChange}
                placeholder="Old Price"
                className="border p-2 mb-2 w-full"
              />
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="border p-2 mb-2 w-full"
              />
              <input
                name="rating"
                type="number"
                value={form.rating}
                onChange={handleChange}
                placeholder="Rating (0-5)"
                className="border p-2 mb-2 w-full"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="border p-2 mb-2 w-full"
              />
              <textarea
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={handleChange}
                placeholder="Additional Info"
                className="border p-2 mb-2 w-full"
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border p-2 mb-2 w-full"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className="font-semibold">Product Images</label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="mb-2 w-full"
              />
              <div className="flex gap-2 flex-wrap mb-2">
                {preview.map((src, i) => (
                  <img key={i} src={src} className="h-16 border rounded" />
                ))}
              </div>

              {/* Colors */}
              <div>
                <label className="font-semibold">Colors</label>
                {form.colors.map((color, idx) => (
                  <div key={idx} className="border p-2 mb-2 rounded">
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) =>
                        handleColorNameChange(idx, e.target.value)
                      }
                      placeholder="Color Name"
                      className="border p-2 mb-2 w-full"
                    />
                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleColorImages(idx, e.target.files)
                      }
                      className="mb-2"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColor}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  + Add Color
                </button>
              </div>

              {/* Reviews */}
              <div className="mt-4">
                <label className="font-semibold">Reviews</label>
                {form.reviews.map((rev, idx) => (
                  <div key={idx} className="border p-2 mb-2 rounded">
                    <input
                      type="text"
                      value={rev.user}
                      onChange={(e) =>
                        handleReviewChange(idx, "user", e.target.value)
                      }
                      placeholder="User Name"
                      className="border p-2 mb-2 w-full"
                    />
                    <input
                      type="number"
                      value={rev.rating}
                      onChange={(e) =>
                        handleReviewChange(idx, "rating", e.target.value)
                      }
                      placeholder="Rating (0-5)"
                      className="border p-2 mb-2 w-full"
                    />
                    <textarea
                      value={rev.comment}
                      onChange={(e) =>
                        handleReviewChange(idx, "comment", e.target.value)
                      }
                      placeholder="Comment"
                      className="border p-2 mb-2 w-full"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReview}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  + Add Review
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
