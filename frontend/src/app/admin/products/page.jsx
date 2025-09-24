"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { makeImageUrl } from "../../../../lib/utils";


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

  // Reset form helper
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

  // Thumbnail preview
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      setPreview(URL.createObjectURL(file));
    }
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

            <form className="space-y-4">
              <input type="text" placeholder="Product Name" className="w-full border p-2 rounded" />
              <input type="number" placeholder="Price" className="w-full border p-2 rounded" />
              <textarea placeholder="Description" className="w-full border p-2 rounded" />

              {/* Category */}
              <select className="w-full border p-2 rounded">
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

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                Save Product
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
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded">
                    Edit
                  </button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded">
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
              <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                Edit
              </button>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
