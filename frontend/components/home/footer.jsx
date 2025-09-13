"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  const [categories, setCategories] = useState([]);

  // ✅ Fetch categories from backend
  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("❌ Failed to load categories", err));
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* 1. Brand + About */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/logo.png" // তোমার logo path
              alt="Habib's Fashion"
              className="w-12 h-12 rounded-lg"
            />
            <h2 className="text-2xl font-bold text-white">Habib's Fashion</h2>
          </div>
          <p className="text-sm mb-4">
            Your ultimate destination for the latest fashion items and stylish
            accessories in Bangladesh. Discover curated products to fit your
            lifestyle and stay ahead in trends.
          </p>
          <div className="flex gap-4 text-xl">
            <Link href="https://facebook.com" target="_blank">
              <FaFacebookF className="hover:text-blue-500" />
            </Link>
            <Link href="https://youtube.com" target="_blank">
              <FaYoutube className="hover:text-red-500" />
            </Link>
            <Link href="https://instagram.com" target="_blank">
              <FaInstagram className="hover:text-pink-500" />
            </Link>
            <Link href="https://tiktok.com" target="_blank">
              <FaTiktok className="hover:text-gray-300" />
            </Link>
          </div>
        </div>

        {/* 2. Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-yellow-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-yellow-300">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/offers" className="hover:text-yellow-300">
                Offers
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-yellow-300">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-2 text-sm">
            {categories.map((cat) => (
              <li key={cat._id || cat.id}>
                <Link
                  href={`/categories/${cat.id}`}
                  className="hover:text-yellow-300"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Contact */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt /> Jamalpur, Bangladesh
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt /> +8801788563988
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> habibsfashion@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <FaGlobe /> www.habibsfashion.com
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-t border-gray-700 mt-6" />

      {/* Copyright */}
      <div className="text-center text-sm text-gray-400 mt-4">
        © 2025 Habib's Fashion. All Rights Reserved.
      </div>
    </footer>
  );
}
