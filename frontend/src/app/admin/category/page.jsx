"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [preview, setPreview] = useState(null);

  // সব ক্যাটেগরি ফেচ
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // নতুন/এডিট ক্যাটেগরি সাবমিট
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newCategory.name);
    if (newCategory.image) {
      formData.append("image", newCategory.image);
    }

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;
      let method = "POST";

      if (isEditing && currentId) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${currentId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (isEditing) {
          setCategories(
            categories.map((c) => (c._id === currentId ? data : c))
          );
        } else {
          setCategories([...categories, data]);
        }

        resetForm();
      } else {
        console.error("Save failed:", data.error);
      }
    } catch (err) {
      console.error("Error saving category:", err);
    }
  }

  // ডিলিট ক্যাটেগরি
  async function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setCategories(categories.filter((c) => c._id !== id));
      } else {
        console.error("Delete failed");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  }

  // এডিট ক্যাটেগরি
  function editCategory(cat) {
    setIsEditing(true);
    setCurrentId(cat._id);
    setNewCategory({ name: cat.name, image: null });
    setPreview(
      cat.image
        ? `${process.env.NEXT_PUBLIC_API_URL.replace("/api", "")}${cat.image}`
        : null
    );
    setShowForm(true);
  }

  // ফর্ম রিসেট
  function resetForm() {
    setNewCategory({ name: "", image: null });
    setPreview(null);
    setIsEditing(false);
    setCurrentId(null);
    setShowForm(false);
  }

  // ইমেজ preview
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setNewCategory({ ...newCategory, image: file });
      setPreview(URL.createObjectURL(file));
    }
  }

  const backendBase = process.env.NEXT_PUBLIC_API_URL.replace("/api", "");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categories</h2>

      {/* Add Category Button */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded mb-6"
      >
        Add Category
      </button>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Category" : "Add New Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                className="w-full border p-2 rounded"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                required
              />

              <input
                type="file"
                accept="image/*"
                className="w-full border p-2 rounded"
                onChange={handleImageChange}
              />

              {preview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <img
                    src={preview}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
              )}

              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                {isEditing ? "Update Category" : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Category Name</th>
            <th className="p-2 text-left">Image</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td className="p-2">
                {c.image ? (
                  <img
                    src={`${backendBase}${c.image}`}
                    alt={c.name}
                    className="w-12 h-12 rounded border object-cover"
                  />
                ) : (
                  "—"
                )}
              </td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => editCategory(c)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(c._id)}
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
  );
}
