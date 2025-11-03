"use client";
import Link from "next/link";
import FooterSkeleton from "../skeletons/FooterSkeleton";
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
  FaUserCircle,
} from "react-icons/fa";

// Icon mapping
const iconMap = {
  FaFacebookF: FaFacebookF,
  FaYoutube: FaYoutube,
  FaInstagram: FaInstagram,
  FaTiktok: FaTiktok,
};

// Static Social Links
const socialLinksData = [
  { icon: "FaFacebookF", url: "https://facebook.com" },
  { icon: "FaYoutube", url: "https://youtube.com" },
  { icon: "FaInstagram", url: "https://instagram.com" },
  { icon: "FaTiktok", url: "https://tiktok.com" },
];

// Static Quick Links
const quickLinksData = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export default function Footer() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/footer`;
    const categoriesUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;

    const fetchData = async () => {
      try {
        const [footerRes, categoriesRes] = await Promise.all([
          fetch(apiUrl),
          fetch(categoriesUrl),
        ]);

        const footerJson = await footerRes.json();
        const categoriesJson = await categoriesRes.json();

        setData(footerJson);
        setCategories(categoriesJson || []); // category model অনুযায়ী
      } catch (err) {
        console.error("❌ Failed to load footer or categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <FooterSkeleton />;
  if (!data) return null;

  const { brand = {}, contact = {}, copyrightText } = data;

  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-2 px-6 md:px-12 mb-15 md:mb-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* 1. Brand + About */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            {brand.logo && !imgError ? (
              <img
                src={brand.logo}
                alt={brand.title || "Brand"}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-700 rounded-lg">
                <FaUserCircle className="text-gray-300 w-6 h-6" />
              </div>
            )}
            <span className="text-xl font-bold text-white block min-w-[100px] truncate">
              {brand.title || "Habib's Fashion"}
            </span>
          </div>
          <p className="text-sm mb-4">{brand.about || "Your fashion destination."}</p>
          <div className="flex gap-4 text-xl">
            {socialLinksData.map((s, idx) => {
              const Icon = iconMap[s.icon] || FaGlobe;
              return (
                <Link key={idx} href={s.url || "#"} target="_blank">
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
            {quickLinksData.map((l, i) => (
              <li key={i}>
                <Link href={l.href} className="hover:text-yellow-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Categories (Database from model) */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-2 text-sm">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat._id || cat.name}>
                  <Link
                    href={`/categories/${cat._id}`}
                    className="hover:text-yellow-300 block min-w-[100px] truncate"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
            )}
          </ul>
        </div>

        {/* 4. Contact */}
<div>
  <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
  <ul className="space-y-2 text-sm">
    {/* Address (optional link to Google Maps if address exists) */}
    {contact.address && (
      <li className="flex items-center gap-2">
        <FaMapMarkerAlt />
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(contact.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-300"
        >
          {contact.address}
        </a>
      </li>
    )}

    {/* Phone */}
    {contact.phone && (
      <li className="flex items-center gap-2">
        <FaPhoneAlt />
        <a href={`tel:${contact.phone}`} className="hover:text-yellow-300">
          {contact.phone}
        </a>
      </li>
    )}

    {/* Email */}
    {contact.email && (
      <li className="flex items-center gap-2">
        <FaEnvelope />
        <a href={`mailto:${contact.email}`} className="hover:text-yellow-300">
          {contact.email}
        </a>
      </li>
    )}

    {/* Website */}
    {contact.website && (
      <li className="flex items-center gap-2">
        <FaGlobe />
        <a
          href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-300"
        >
          {contact.website}
        </a>
      </li>
    )}
  </ul>
</div>

      </div>

      <hr className="border-t border-gray-700 mt-6" />

      <div className="text-center text-sm text-gray-400 mt-2">
        {copyrightText ||
          `© ${new Date().getFullYear()} ${brand.title || "Habib's Fashion"}. All Rights Reserved.`}
      </div>
    </footer>
  );
}
