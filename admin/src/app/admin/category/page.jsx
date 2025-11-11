"use client";

import { useEffect, useState, useRef } from "react";
import Toast from "../../../../components/Toast";
import CategoriesSkeleton from "../../../../components/Skeleton/CategoriesSkeleton";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const dropRef = useRef(null);

  // 🔹 Load Categories
  const loadCategories = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setToast({ message: "⚠ Failed to load categories", type: "error" });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 🔹 Close modal helper
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setName("");
    setFile(null);
    setPreview("");
    setLoading(false);
  };

  // 🔹 Handle Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", name);
    if (file) data.append("image", file);

    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;
    let method = "POST";

    if (editId) {
      url += `/${editId}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        setToast({
          message: editId ? "✅ Category updated!" : "✅ Category added!",
          type: "success",
        });
        closeModal();
        loadCategories();
      } else {
        setToast({ message: "❌ Error saving category", type: "error" });
      }
    } catch {
      setToast({ message: "🌐 Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit
  const handleEdit = (c) => {
    setEditId(c._id);
    setName(c.name);
    setPreview(c.image);
    setShowModal(true);
  };

  // 🔹 Delete confirm
  const confirmDelete = (c) => setDeleteModal(c);

  // 🔹 Handle delete
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${deleteModal._id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setToast({ message: "🗑 Category deleted!", type: "success" });
        setDeleteModal(null);
        loadCategories();
      } else {
        setToast({ message: "❌ Error deleting category", type: "error" });
      }
    } catch {
      setToast({ message: "🌐 Network error", type: "error" });
    }
    setDeleting(false);
  };

  // 🔹 File drop / upload
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📂 Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-all"
        >
          + Add Category
        </button>
      </div>

      {/* Category Grid */}
      {pageLoading ? (
        <CategoriesSkeleton />
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No categories found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div
              key={c._id}
              className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm flex flex-col items-center hover:shadow-md transition-all"
            >
              {c.image && (
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-24 w-24 object-cover rounded-full mb-2"
                />
              )}
              <h2 className="font-semibold">{c.name}</h2>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(c)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🧩 Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              {editId ? "✏️ Edit Category" : "➕ Add Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="border border-gray-300 rounded-lg p-2 w-full mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />

              {/* Upload Area */}
              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() =>
                  dropRef.current?.querySelector("input")?.click()
                }
                className="border-2 border-dashed border-gray-400 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-500">Drag & drop or click to upload</span>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      setFile(f);
                      setPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                  {loading
                    ? "Saving..."
                    : editId
                    ? "Update Category"
                    : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑 Delete Modal */}
      {deleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4"
          onClick={() => !deleting && setDeleteModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-3 text-red-600">⚠ Delete Category</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteModal.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
