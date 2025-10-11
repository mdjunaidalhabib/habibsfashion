"use client";
import { useEffect, useState, useRef } from "react";
import Toast from "../../../components/Toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const dropRef = useRef(null);

  const loadCategories = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories");
    setCategories(await res.json());
  };

  useEffect(() => { loadCategories(); }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setName("");
    setFile(null);
    setPreview("");
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", name);
    if (file) data.append("image", file);

    let url = process.env.NEXT_PUBLIC_API_URL + "/api/categories";
    let method = "POST";

    if (editId) {
      url += "/" + editId;
      method = "PUT";
    }

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        setToast({ message: editId ? "Category updated!" : "Category added!", type: "success" });
        closeModal();
        loadCategories();
      } else {
        setToast({ message: "Error saving category", type: "error" });
        setLoading(false);
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
      setLoading(false);
    }
  };

  const handleEdit = (c) => {
    setEditId(c._id);
    setName(c.name);
    setPreview(c.image);
    setShowModal(true);
  };

  const confirmDelete = (c) => setDeleteModal(c);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/categories/" + deleteModal._id, { method: "DELETE" });
      if (res.ok) {
        setToast({ message: "Category deleted!", type: "success" });
        setDeleteModal(null);
        loadCategories();
      } else {
        setToast({ message: "Error deleting category", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    }
    setDeleting(false);
  };

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
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Categories</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700">+ Add</button>
      </div>

      {/* Category List */}
      <div className="grid md:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c._id} className="border rounded shadow p-3 flex flex-col items-center">
            {c.image && <img src={c.image} alt={c.name} className="h-24 w-24 object-cover rounded-full mb-2" />}
            <h2 className="font-semibold">{c.name}</h2>
            <div className="mt-2 flex gap-2">
              <button onClick={() => handleEdit(c)} className="bg-yellow-500 text-white px-2 py-1 rounded transition hover:bg-yellow-600">Edit</button>
              <button onClick={() => confirmDelete(c)} className="bg-red-500 text-white px-2 py-1 rounded transition hover:bg-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">{editId ? "Edit Category" : "Add Category"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" className="border p-2 mb-2 w-full" required />
              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-400 rounded h-24 flex items-center justify-center mb-2 cursor-pointer hover:border-blue-500 transition"
                onClick={() => dropRef.current?.querySelector("input")?.click()}
              >
                {preview ? <img src={preview} className="h-20 w-20 object-cover rounded-full" /> : <span>Drag & Drop or Click to Upload</span>}
                <input type="file" className="hidden" onChange={e => { const f = e.target.files[0]; if(f){ setFile(f); setPreview(URL.createObjectURL(f)); }}} />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded transition hover:bg-green-700" disabled={loading}>
                  {loading ? "Saving..." : (editId ? "Update" : "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40" onClick={() => !deleting && setDeleteModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-red-600">Delete Category</h2>
            <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{deleteModal.name}</span>?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 border rounded" disabled={deleting}>Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded transition hover:bg-red-700" disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
