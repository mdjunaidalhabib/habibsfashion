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

const iconMap = {
  FaFacebookF: FaFacebookF,
  FaYoutube: FaYoutube,
  FaInstagram: FaInstagram,
  FaTiktok: FaTiktok
  // যদি নতুন icon নাম use করো, map-এ add করে দিও
};

export default function Footer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/footer`;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => {
        console.error("❌ Failed to load footer", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <footer className="bg-gray-900 text-gray-200 pt-10 pb-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">Loading footer...</div>
      </footer>
    );
  }

  if (!data) {
    return null;
  }

  const {
    brand = {},
    socials = [],
    quickLinks = [],
    categories = [],
    contact = {},
    copyrightText
  } = data;

  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* 1. Brand + About */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={brand.logo || "/logo.png"}
              alt={brand.title || "Brand"}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <h2 className="text-2xl font-bold text-white">{brand.title || "Habib's Fashion"}</h2>
          </div>
          <p className="text-sm mb-4">{brand.about}</p>
          <div className="flex gap-4 text-xl">
            {socials.map((s, idx) => {
              const Icon = iconMap[s.icon] || FaGlobe;
              return (
                <Link key={idx} href={s.url || '#'} target="_blank">
                  <Icon className="hover:text-yellow-300" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* 2. Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((l, i) => (
              <li key={i}>
                <Link href={l.href || '/'} className="hover:text-yellow-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-2 text-sm">
            {categories.map((cat) => (
              <li key={cat._id || cat.slug || cat.name}>
                <Link href={`/categories/${cat.slug || cat.name}`} className="hover:text-yellow-300">
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
              <FaMapMarkerAlt /> {contact.address}
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt /> {contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> {contact.email}
            </li>
            <li className="flex items-center gap-2">
              <FaGlobe /> {contact.website}
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-t border-gray-700 mt-6" />

      <div className="text-center text-sm text-gray-400 mt-4">
        {copyrightText || `© ${new Date().getFullYear()} ${brand.title || "Habib's Fashion"}. All Rights Reserved.`}
      </div>
    </footer>
  );
}
