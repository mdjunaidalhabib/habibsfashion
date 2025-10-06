"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { apiFetch } from "../../utils/api";
import { FaHome, FaThLarge, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import SearchBox from "./SearchBox";
import MobileAccountMenu from "./MobileAccountMenu";
import AccountMenu from "./AccountMenu";
import CartIcon from "./CartIcon";
import WishlistIcon from "./WishlistIcon";

const sideMenu = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};
const topBar = { open: { rotate: 45, y: 10 }, closed: { rotate: 0, y: 0 } };
const middleBar = { open: { opacity: 0 }, closed: { opacity: 1 } };
const bottomBar = { open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } };

export default function Navbar() {
  const [navbar, setNavbar] = useState(null);
  const pathname = usePathname();
  const { cart = {}, wishlist = [] } = useCart() || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + (qty || 0), 0);
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/auth/me");
        setMe(data.user);
      } catch {
        setMe(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/navbar`);
        const data = await res.json();
        setNavbar(data);
      } catch (err) {
        console.error("❌ Failed to load navbar:", err);
      }
    };
    fetchNavbar();
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || mobileSearchOpen ? "hidden" : "auto";
  }, [menuOpen, mobileSearchOpen]);

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* 🧭 Top Navbar */}
      <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          {/* 📱 Mobile Search Icon */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
          >
            <FaSearch className="w-5 h-5" />
          </button>

          {/* 🏷 Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            {navbar?.brand?.logo ? (
              <img
                src={navbar.brand.logo}
                alt="Logo"
                className="h-8 w-8 md:h-10 md:w-10 object-cover rounded-full"
              />
            ) : (
              <span className="text-xl font-bold text-blue-600">
                {navbar?.brand?.name || "Brand Name"}
              </span>
            )}
            {navbar?.brand?.name && navbar?.brand?.logo && (
              <span className="text-lg font-semibold text-gray-800">
                {navbar.brand.name}
              </span>
            )}
          </Link>

          {/* 📱 Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-[5px] z-50"
            aria-label="Toggle menu"
          >
            <motion.span
              variants={topBar}
              animate={menuOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
              className="block h-1 w-6 bg-gray-800 rounded origin-center"
            />
            <motion.span
              variants={middleBar}
              animate={menuOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
              className="block h-1 w-6 bg-gray-800 rounded origin-center"
            />
            <motion.span
              variants={bottomBar}
              animate={menuOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
              className="block h-1 w-6 bg-gray-800 rounded origin-center"
            />
          </button>

          {/* 💻 Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link
              href="/"
              className={`hover:text-blue-600 transition ${
                isActive("/") ? "text-blue-600 border-b-2 border-blue-600" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`hover:text-blue-600 transition ${
                isActive("/products")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : ""
              }`}
            >
              All Products
            </Link>
            <Link
              href="/categories"
              className={`hover:text-blue-600 transition ${
                isActive("/categories")
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : ""
              }`}
            >
              Shop by Category
            </Link>
          </div>

          {/* 💻 Desktop Actions */}
          <div className="hidden md:flex items-center gap-4 relative">
            <SearchBox
              mobileSearchOpen={mobileSearchOpen}
              setMobileSearchOpen={setMobileSearchOpen}
            />
            <AccountMenu me={me} setMe={setMe} loadingUser={loadingUser} />
            <CartIcon cartCount={cartCount} />
            <WishlistIcon wishlistCount={wishlistCount} />
          </div>
        </div>

        {/* 📱 Mobile Search Inside Navbar */}
        {mobileSearchOpen && (
          <div className="md:hidden bg-white shadow-inner border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SearchBox
                  mobileSearchOpen={mobileSearchOpen}
                  setMobileSearchOpen={setMobileSearchOpen}
                />
              </div>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-gray-600 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 📱 Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                variants={sideMenu}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed top-[60px] left-0 bottom-0 w-64 bg-white shadow-lg p-6 flex flex-col space-y-4 z-50"
              >
                <Link
                  href="/"
                  className={`block px-4 py-2 rounded ${
                    isActive("/") ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className={`block px-4 py-2 rounded ${
                    isActive("/products")
                      ? "bg-blue-100 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/categories"
                  className={`block px-4 py-2 rounded ${
                    isActive("/categories")
                      ? "bg-blue-100 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Shop by Category
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* 📱 Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t md:hidden z-50">
        <div className="flex justify-around items-center py-2 text-sm">
          <Link href="/" className="flex flex-col items-center">
            <FaHome className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/categories" className="flex flex-col items-center">
            <FaThLarge className="w-5 h-5" />
            <span>Category</span>
          </Link>
          <WishlistIcon wishlistCount={wishlistCount} mobile />
          <CartIcon cartCount={cartCount} mobile />
          <MobileAccountMenu me={me} setMe={setMe} loadingUser={loadingUser} />
        </div>
      </div>
    </>
  );
}
