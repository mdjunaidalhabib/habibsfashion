"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, Edit, Trash, X } from "lucide-react";

export default function ProductsManagement() {
  const [products, setProducts] = useState([
    { id: 1, name: "Laptop", price: "$1200", stock: 12 },
    { id: 2, name: "Headphones", price: "$200", stock: 30 },
    { id: 3, name: "Keyboard", price: "$80", stock: 50 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    const id = products.length + 1;
    setProducts([...products, { id, ...newProduct }]);
    setNewProduct({ name: "", price: "", stock: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Products</h2>
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} /> Add Product
          </Button>
        </div>

        {/* Table */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-2">{product.id}</td>
                <td className="p-2">{product.name}</td>
                <td className="p-2">{product.price}</td>
                <td className="p-2">{product.stock}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Edit size={14} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex items-center gap-1"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash size={14} /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add New Product</h3>
                <button onClick={() => setShowForm(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full border p-2 rounded"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Price"
                  className="w-full border p-2 rounded"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  className="w-full border p-2 rounded"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
                <Button className="w-full" onClick={handleAddProduct}>
                  Save Product
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
