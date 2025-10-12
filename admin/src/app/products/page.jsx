"use client";
import { useEffect, useState } from "react";
import ProductForm from "../../../components/ProductForm";
import ProductCard from "../../../components/ProductCard";
import Toast from "../../../components/Toast";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load products
  const loadProducts = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products");
    setProducts(await res.json());
  };
  useEffect(() => { loadProducts(); }, []);

  // Delete confirm
  const confirmDelete = (product) => setDeleteModal(product);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${deleteModal._id}`, { method: "DELETE" });
      if (res.ok) {
        setToast({ message: "🗑 Product deleted!", type: "error" });
        setDeleteModal(null);
        loadProducts();
      } else {
        setToast({ message: "Error deleting product", type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    }
    setDeleting(false);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">✨ Product Manager</h1>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowForm(true);
          }}
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white font-semibold shadow transition-all w-full sm:w-auto ${
            saving
              ? "bg-gray-400"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105"
          }`}
        >
          {saving ? "Adding..." : "+ Add Product"}
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onEdit={() => {
              setEditProduct(p);
              setShowForm(true);
            }}
            onDelete={() => confirmDelete(p)}
          />
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl sm:max-w-4xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] relative">
            <ProductForm
              product={editProduct}
              onClose={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                loadProducts();
                setToast({
                  message: editProduct ? "✅ Product updated!" : "✅ Product added!",
                  type: "success",
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4"
          onClick={() => !deleting && setDeleteModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md shadow-xl border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-3 text-red-600">⚠ Delete Product</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-black">{deleteModal.name}</span>?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 w-full sm:w-auto"
              >
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
