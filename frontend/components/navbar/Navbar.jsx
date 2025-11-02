"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaThLarge, FaSearch, FaUserCircle } from "react-icons/fa";
import { X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { apiFetch } from "../../utils/api";

import SearchBox from "./SearchBox";
import AccountMenu from "./AccountMenu";
import AccountMenuMobile from "./AccountMenuMobile";
import CartIcon from "./CartIcon";
import WishlistIcon from "./WishlistIcon";

// ✅ Motion variants
const sideMenu = { hidden: { x: "-100%" }, visible: { x: 0 }, exit: { x: "-100%" } };
const topBar = { open: { rotate: 45, y: 10 }, closed: { rotate: 0, y: 0 } };
const middleBar = { open: { opacity: 0 }, closed: { opacity: 1 } };
const bottomBar = { open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } };

export default function Navbar() {
  const [navbar, setNavbar] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [accountActive, setAccountActive] = useState(false);

  const pathname = usePathname();
  const { cart = {}, wishlist = [] } = useCart() || {};
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + (qty || 0), 0);
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // 🔹 Load logged-in user info
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

  // 🔹 Fetch navbar data (Brand info)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/navbar`);
        const data = await res.json();
        setNavbar(data);
      } catch (err) {
        console.error("❌ Navbar load failed:", err);
      }
    })();
  }, [API_URL]);

  // 🔹 ESC key to close
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

  // 🔹 Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = menuOpen || mobileSearchOpen ? "hidden" : "auto";
  }, [menuOpen, mobileSearchOpen]);

  // 🔹 Reset account active
  useEffect(() => {
    if (!pathname.startsWith("/profile") && !pathname.startsWith("/orders")) {
      setAccountActive(false);
    }
  }, [pathname]);

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* 🧭 Navbar */}
      <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          {/* 🔍 Mobile Search Icon */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Search"
          >
            <FaSearch className="w-5 h-5 text-rose-600" />
          </button>

          {/* 🏷 Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            {navbar?.brand?.logo && !imgError ? (
              <img
                src={navbar.brand.logo}
                alt="Logo"
                className="h-8 w-8 md:h-10 md:w-10 object-cover rounded-full"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                <FaUserCircle className="text-gray-400 w-6 h-6" />
              </div>
            )}

            {navbar?.brand?.name ? (
              <span className="text-lg font-semibold truncate min-w-[100px]">
                {navbar.brand.name}
              </span>
            ) : (
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            )}
          </Link>

          {/* ☰ Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-[5px]"
            aria-label="Toggle Menu"
          >
            <motion.span variants={topBar} animate={menuOpen ? "open" : "closed"} className="block h-1 w-6 bg-rose-600 rounded" />
            <motion.span variants={middleBar} animate={menuOpen ? "open" : "closed"} className="block h-1 w-6 bg-rose-600 rounded" />
            <motion.span variants={bottomBar} animate={menuOpen ? "open" : "closed"} className="block h-1 w-6 bg-rose-600 rounded" />
          </button>

          {/* 💻 Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            {[
              { path: "/", label: "Home" },
              { path: "/products", label: "All Products" },
              { path: "/categories", label: "Shop by Category" },
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`hover:text-blue-600 transition ${isActive(link.path) ? "text-blue-600 border-b-2 border-blue-600" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* 💻 Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} />
            <AccountMenu me={me} setMe={setMe} loadingUser={loadingUser} />
            <CartIcon cartCount={cartCount} />
            <WishlistIcon wishlistCount={wishlistCount} />
          </div>
        </div>
      </nav>

      {/* 📱 Mobile Search */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBox mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} />
            </div>
            <button onClick={() => setMobileSearchOpen(false)} className="p-2 text-gray-600 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 📱 Mobile Sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              variants={sideMenu}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-[60px] left-0 bottom-0 w-56 bg-white shadow-lg p-3 flex flex-col z-50"
            >
              {[
                { path: "/", label: "Home", icon: <FaHome /> },
                { path: "/products", label: "All Products", icon: <FaThLarge /> },
                { path: "/categories", label: "Shop by Category", icon: <FaSearch /> },
              ].map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded transition ${
                    isActive(link.path)
                      ? "text-rose-600 bg-rose-100 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 📱 Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner md:hidden z-50">
        <div className="flex justify-around items-center py-2 text-sm">
          <Link href="/" className={`flex flex-col items-center ${isActive("/") ? "text-rose-600" : "text-gray-700"}`}>
            <FaHome className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/categories" className={`flex flex-col items-center ${isActive("/categories") ? "text-rose-600" : "text-gray-700"}`}>
            <FaThLarge className="w-5 h-5" />
            <span>Category</span>
          </Link>
          <WishlistIcon wishlistCount={wishlistCount} mobile />
          <CartIcon cartCount={cartCount} mobile />
          <AccountMenuMobile me={me} setMe={setMe} loadingUser={loadingUser} onOpen={() => setAccountActive(true)} />
        </div>
      </div>
    </>
  );
}
