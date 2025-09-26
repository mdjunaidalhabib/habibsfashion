"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { makeImageUrl } from "../../../lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    oldPrice: "",
    stock: "",
    description: "",
    additionalInfo: "",
    category: "",
    image: "",
    images: [],
    colors: [],
    reviews: [],
  });
  const [preview, setPreview] = useState(null);

  // Fetch Products + Categories
  useEffect(() => {
    async function fetchData() {
      try {
        const prodRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`
        );
        setProducts(await prodRes.json());

        const catRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        setCategories(await catRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // Reset form
  function resetForm() {
    setNewProduct({
      name: "",
      price: "",
      oldPrice: "",
      stock: "",
      description: "",
      additionalInfo: "",
      category: "",
      image: "",
      images: [],
      colors: [],
      reviews: [],
    });
    setPreview(null);
    setIsEditing(false);
    setCurrentId(null);
    setShowForm(false);
  }

  // Handle Input
  function handleChange(e) {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  }

  // Handle Reviews Change
  function handleReviewChange(index, field, value) {
    const updatedReviews = [...newProduct.reviews];
    updatedReviews[index][field] = value;
    setNewProduct({ ...newProduct, reviews: updatedReviews });
  }

  function addReview() {
    setNewProduct({
      ...newProduct,
      reviews: [...newProduct.reviews, { user: "", rating: "", comment: "" }],
    });
  }

  function removeReview(index) {
    const updatedReviews = [...newProduct.reviews];
    updatedReviews.splice(index, 1);
    setNewProduct({ ...newProduct, reviews: updatedReviews });
  }

  // Thumbnail preview
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      setPreview(URL.createObjectURL(file));
    }
  }

  // Save Product (Add or Update)
  async function handleSubmit(e) {
    e.preventDefault();

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${currentId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;

    const formData = new FormData();

    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("oldPrice", newProduct.oldPrice);
    formData.append("stock", newProduct.stock);
    formData.append("description", newProduct.description);
    formData.append("additionalInfo", newProduct.additionalInfo);
    formData.append("category", newProduct.category);

    if (newProduct.image && typeof newProduct.image !== "string") {
      formData.append("image", newProduct.image);
    }

    formData.append("reviews", JSON.stringify(newProduct.reviews || []));
    formData.append("images", JSON.stringify(newProduct.images || []));
    formData.append("colors", JSON.stringify(newProduct.colors || []));

    const res = await fetch(url, {
      method,
      body: formData,
    });

    const data = await res.json();

    if (method === "POST") {
      setProducts([...products, data]);
    } else {
      setProducts(products.map((p) => (p._id === data._id ? data : p)));
    }

    resetForm();
  }

  // Delete Product
  async function handleDelete(id) {
    if (confirm("Are you sure?")) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
        { method: "DELETE" }
      );
      setProducts(products.filter((p) => p._id !== id));
    }
  }

  // Edit Product
  function handleEdit(p) {
    setShowForm(true);
    setIsEditing(true);
    setCurrentId(p._id);
    setNewProduct({
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      stock: p.stock,
      description: p.description,
      additionalInfo: p.additionalInfo,
      category: p.category?._id || "",
      image: p.image,
      images: p.images,
      colors: p.colors,
      reviews: p.reviews || [],
    });
    setPreview(p.image ? makeImageUrl(p.image) : null);
  }

  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Products</h2>

      <button
        onClick={() => setShowForm(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded mb-6 w-full sm:w-auto"
      >
        Add Product
      </button>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                placeholder="Price"
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="number"
                name="oldPrice"
                value={newProduct.oldPrice}
                onChange={handleChange}
                placeholder="Old Price"
                className="w-full border p-2 rounded"
              />

              <input
                type="number"
                name="stock"
                value={newProduct.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="w-full border p-2 rounded"
                required
              />

              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border p-2 rounded"
              />

              <textarea
                name="additionalInfo"
                value={newProduct.additionalInfo}
                onChange={handleChange}
                placeholder="Additional Info"
                className="w-full border p-2 rounded"
              />

              {/* Category */}
              <select
                name="category"
                value={newProduct.category}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Thumbnail */}
              <input
                type="file"
                accept="image/*"
                className="w-full border p-2 rounded"
                onChange={handleImageChange}
              />
              {preview && (
                <div className="relative w-24 h-24">
                  <Image
                    src={preview}
                    alt="preview"
                    fill
                    className="object-cover rounded border"
                  />
                </div>
              )}

              {/* ✅ Reviews Section */}
              <div className="border p-3 rounded">
                <h4 className="font-semibold mb-2">Reviews</h4>
                {newProduct.reviews.map((review, index) => (
                  <div key={index} className="border p-2 rounded mb-2 space-y-2">
                    <input
                      type="text"
                      value={review.user}
                      onChange={(e) =>
                        handleReviewChange(index, "user", e.target.value)
                      }
                      placeholder="User"
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={review.rating}
                      onChange={(e) =>
                        handleReviewChange(index, "rating", e.target.value)
                      }
                      placeholder="Rating (0-5)"
                      className="w-full border p-2 rounded"
                    />
                    <textarea
                      value={review.comment}
                      onChange={(e) =>
                        handleReviewChange(index, "comment", e.target.value)
                      }
                      placeholder="Comment"
                      className="w-full border p-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeReview(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Remove Review
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addReview}
                  className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
                >
                  Add Review
                </button>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                {isEditing ? "Update Product" : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table for desktop */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Rating</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Image</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2">৳{p.price}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2">{p.rating ? p.rating.toFixed(1) : "—"}</td>
                <td className="p-2">{p.category?.name || "—"}</td>
                <td className="p-2">
                  {p.image ? (
                    <div className="relative w-10 h-10">
                      <Image
                        src={makeImageUrl(p.image)}
                        alt={p.name}
                        fill
                        className="object-cover rounded border"
                      />
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="grid gap-3 md:hidden">
        {products.map((p) => (
          <div key={p._id} className="border rounded-lg p-3 bg-white">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">{p.name}</h4>
              <span className="text-sm text-gray-600">৳{p.price}</span>
            </div>
            <div className="text-sm text-gray-600">Stock: {p.stock}</div>
            <div className="text-sm text-gray-600">
              Rating: {p.rating ? p.rating.toFixed(1) : "—"}
            </div>
            <div className="text-sm text-gray-600">
              Category: {p.category?.name || "—"}
            </div>
            {p.image && (
              <div className="relative w-20 h-20 mt-2">
                <Image
                  src={makeImageUrl(p.image)}
                  alt={p.name}
                  fill
                  className="object-cover rounded border"
                />
              </div>
            )}
            <div className="mt-2 flex gap-2 flex-wrap">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
