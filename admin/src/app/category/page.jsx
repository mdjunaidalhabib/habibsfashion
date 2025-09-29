"use client";
import { useEffect, useState } from "react";

// ✅ Toast Component
function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button className="ml-4" onClick={onClose}>✖</button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState(null);

  // Load Categories
  const loadCategories = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories");
    setCategories(await res.json());
  };

  useEffect(() => { loadCategories(); }, []);

  // Submit Add/Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", name);
    if (file) data.append("image", file);

    let url = process.env.NEXT_PUBLIC_API_URL + "/api/categories";
    let method = "POST";

    if (editId) {
      url += "/" + editId;
      method = "PUT";
    }

    const res = await fetch(url, { method, body: data });
    if (res.ok) {
      setToast({ message: editId ? "Category updated!" : "Category added!", type: "success" });
      setShowModal(false);
      setEditId(null);
      setName("");
      setFile(null);
      setPreview("");
      loadCategories();
    } else {
      setToast({ message: "Error saving category", type: "error" });
    }
  };

  // Edit
  const handleEdit = (c) => {
    setEditId(c._id);
    setName(c.name);
    setPreview(c.image);
    setShowModal(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories/" + id, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: "Category deleted!", type: "success" });
      loadCategories();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Categories</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add</button>
      </div>

      {/* Category List */}
      <div className="grid md:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c._id} className="border rounded shadow p-3 flex flex-col items-center">
            {c.image && <img src={c.image} alt={c.name} className="h-24 w-24 object-cover rounded mb-2" />}
            <h2 className="font-semibold">{c.name}</h2>
            <div className="mt-2 flex gap-2">
              <button onClick={() => handleEdit(c)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(c._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">{editId ? "Edit Category" : "Add Category"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" className="border p-2 mb-2 w-full" />
              {preview && <img src={preview} className="h-20 mb-2 rounded border" />}
              <input type="file" onChange={(e) => { setFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); }} className="mb-2" />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{editId ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
