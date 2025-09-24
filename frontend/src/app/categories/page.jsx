"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import ProductCard from "../../../components/home/ProductCard";
import { makeImageUrl } from "../../../lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  const fetchProducts = (categoryId) => {
    setSelectedCategory(categoryId);
    axios
      .get(`${API_URL}/api/products/category/${categoryId}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex gap-6 p-6">
      {/* === Category Sidebar === */}
      <div className="w-64 bg-white shadow-md rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">🗂️ Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat._id}
              onClick={() => fetchProducts(cat._id)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                selectedCategory === cat._id
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              {cat.image && (
                <div className="relative w-10 h-10">
                  <Image
                    src={makeImageUrl(cat.image)}
                    alt={cat.name}
                    fill
                    className="rounded-md object-cover border"
                  />
                </div>
              )}
              <span>{cat.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* === Product List === */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-4">
          {selectedCategory ? "Products" : "👉 প্রথমে কোনো Category সিলেক্ট করুন"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
