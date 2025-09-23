"use client";

import { useEffect, useState } from "react";

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
    rating: "",
    stock: "",
    description: "",
    additionalInfo: "",
    category: "",
    image: null,
    images: [],
    colors: [],
    reviews: [],
  });
  const [preview, setPreview] = useState(null);

  // ✅ Fetch products + categories
  useEffect(() => {
    async function fetchData() {
      try {
        const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        setProducts(await prodRes.json());

        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        setCategories(await catRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // ✅ Save Product (Add / Edit)
  async function saveProduct(e) {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => {
      if (key === "images" || key === "colors" || key === "reviews") {
        formData.append(key, JSON.stringify(value));
      } else if (key === "image" && value instanceof File) {
        formData.append("image", value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
      let method = "POST";

      if (isEditing && currentId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/products/${currentId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        if (isEditing) {
          setProducts(products.map((p) => (p._id === currentId ? data : p)));
        } else {
          setProducts([...products, data]);
        }
        resetForm();
      } else {
        console.error("Save failed:", data.error);
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  }

  // ✅ Delete Product
  async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  }

  // ✅ Edit Product (ফর্মে পুরানো ডেটা বসাবে)
  function editProduct(prod) {
    setIsEditing(true);
    setCurrentId(prod._id);
    setNewProduct({
      name: prod.name,
      price: prod.price,
      oldPrice: prod.oldPrice,
      rating: prod.rating,
      stock: prod.stock,
      description: prod.description,
      additionalInfo: prod.additionalInfo,
      category: prod.category?._id || prod.category, // 👈 Default category select হবে
      image: null,
      images: prod.images || [],
      colors: prod.colors || [],
      reviews: prod.reviews || [],
    });
    setPreview(prod.image ? `${backendBase}${prod.image}` : null);
    setShowForm(true);
  }

  // Reset Form
  function resetForm() {
    setNewProduct({
      name: "",
      price: "",
      oldPrice: "",
      rating: "",
      stock: "",
      description: "",
      additionalInfo: "",
      category: "",
      image: null,
      images: [],
      colors: [],
      reviews: [],
    });
    setPreview(null);
    setIsEditing(false);
    setCurrentId(null);
    setShowForm(false);
  }

  // Thumbnail
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      setPreview(URL.createObjectURL(file));
    }
  }

  // Colors update
  function addColor() {
    setNewProduct({
      ...newProduct,
      colors: [...newProduct.colors, { name: "", images: [] }],
    });
  }
  function updateColor(index, field, value) {
    const colors = [...newProduct.colors];
    colors[index][field] = value;
    setNewProduct({ ...newProduct, colors });
  }

  // Reviews update
  function addReview() {
    setNewProduct({
      ...newProduct,
      reviews: [...newProduct.reviews, { user: "", rating: 0, comment: "" }],
    });
  }
  function updateReview(index, field, value) {
    const reviews = [...newProduct.reviews];
    reviews[index][field] = value;
    setNewProduct({ ...newProduct, reviews });
  }

  const backendBase = process.env.NEXT_PUBLIC_API_URL.replace("/api", "");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {/* Add Product Button */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded mb-6"
      >
        Add Product
      </button>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>

            <form onSubmit={saveProduct} className="space-y-4">
              {/* Basic fields */}
              <input type="text" placeholder="Product Name" className="w-full border p-2 rounded"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input type="number" placeholder="Price" className="w-full border p-2 rounded"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <input type="number" placeholder="Old Price" className="w-full border p-2 rounded"
                value={newProduct.oldPrice}
                onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
              />
              <input type="number" placeholder="Rating" className="w-full border p-2 rounded"
                value={newProduct.rating}
                onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
              />
              <input type="number" placeholder="Stock" className="w-full border p-2 rounded"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              />

              <textarea placeholder="Description" className="w-full border p-2 rounded"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <textarea placeholder="Additional Info" className="w-full border p-2 rounded"
                value={newProduct.additionalInfo}
                onChange={(e) => setNewProduct({ ...newProduct, additionalInfo: e.target.value })}
              />

              {/* ✅ Category Dropdown */}
              <select
                className="w-full border p-2 rounded"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Thumbnail */}
              <input type="file" accept="image/*" className="w-full border p-2 rounded"
                onChange={handleImageChange}
              />
              {preview && (
                <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded border" />
              )}

              {/* Colors */}
              <div>
                <h4 className="font-semibold">Colors</h4>
                {newProduct.colors.map((c, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" className="border p-2 rounded flex-1"
                      placeholder="Color Name"
                      value={c.name}
                      onChange={(e) => updateColor(idx, "name", e.target.value)}
                    />
                  </div>
                ))}
                <button type="button" onClick={addColor} className="bg-blue-500 text-white px-3 py-1 rounded">
                  + Add Color
                </button>
              </div>

              {/* Reviews */}
              <div>
                <h4 className="font-semibold">Reviews</h4>
                {newProduct.reviews.map((r, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" className="border p-2 rounded flex-1"
                      placeholder="User"
                      value={r.user}
                      onChange={(e) => updateReview(idx, "user", e.target.value)}
                    />
                    <input type="number" className="border p-2 rounded w-20"
                      placeholder="Rating"
                      value={r.rating}
                      onChange={(e) => updateReview(idx, "rating", e.target.value)}
                    />
                    <input type="text" className="border p-2 rounded flex-1"
                      placeholder="Comment"
                      value={r.comment}
                      onChange={(e) => updateReview(idx, "comment", e.target.value)}
                    />
                  </div>
                ))}
                <button type="button" onClick={addReview} className="bg-blue-500 text-white px-3 py-1 rounded">
                  + Add Review
                </button>
              </div>

              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
                {isEditing ? "Update Product" : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Image</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">${p.price}</td>
              <td className="p-2">{p.stock}</td>
              <td className="p-2">{p.category?.name || "—"}</td>
              <td className="p-2">
                {p.image ? (
                  <img src={`${backendBase}${p.image}`} alt={p.name} className="w-10 h-10 rounded border" />
                ) : (
                  "—"
                )}
              </td>
              <td className="p-2 space-x-2">
                <button onClick={() => editProduct(p)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Edit
                </button>
                <button onClick={() => deleteProduct(p._id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
