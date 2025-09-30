"use client";
import { useEffect, useState, useRef } from "react";
import ProductForm from "../../../components/ProductForm";
import ProductCard from "../../../components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Load Products
  const loadProducts = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products");
    setProducts(await res.json());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("❌ Delete this product?")) return;
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products/" + id, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("🗑 Product deleted");
      loadProducts();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">✨ Product Manager</h1>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onEdit={() => {
              setEditProduct(p);
              setShowForm(true);
            }}
            onDelete={() => handleDelete(p._id)}
          />
        ))}
      </div>

      {/* Modal for Add/Edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
            <ProductForm
              product={editProduct}
              onClose={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                loadProducts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
