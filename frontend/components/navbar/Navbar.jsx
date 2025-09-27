"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { apiFetch } from "../../utils/api";
import { FaHome, FaThLarge, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // ✅ fixed import

import SearchBox from "./SearchBox";
import MobileAccountMenu from "./MobileAccountMenu";
import AccountMenu from "./AccountMenu"; // ✅ added
import CartIcon from "./CartIcon";
import WishlistIcon from "./WishlistIcon";
import { X } from "lucide-react";

const sideMenu = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};
const topBar = { open: { rotate: 45, y: 10 }, closed: { rotate: 0, y: 0 } };
const middleBar = { open: { opacity: 0 }, closed: { opacity: 1 } };
const bottomBar = { open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } };

export default function Navbar() {
  const { cart = {}, wishlist = [] } = useCart() || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const cartCount = Object.values(cart).reduce(
    (sum, qty) => sum + (qty || 0),
    0
  );
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/auth/me"); // ✅ no credentials needed
        setMe(data.user);
      } catch {
        setMe(null);
      } finally {
        setLoadingUser(false);
      }
    })();
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
    document.body.style.overflow =
      menuOpen || mobileSearchOpen ? "hidden" : "auto";
  }, [menuOpen, mobileSearchOpen]);

  // ✅ Dummy search (demo only)
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const products = await apiFetch("/api/products");
      const filtered = products.filter((p) =>
        String(p?.name || "").toLowerCase().includes(q.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 20));
    } catch {
      setSearchResults([]);
    }
  };

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          {/* Mobile Left: Search icon */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
          >
            <FaSearch className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            𝐇𝐚𝐛𝐢𝐛'𝐬 𝐅𝐚𝐬𝐡𝐢𝐨𝐧
          </Link>

          {/* Mobile Right: Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-[5px] z-50"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/products" className="hover:text-blue-600 transition">
              All Products
            </Link>
            <Link href="/categories" className="hover:text-blue-600 transition">
              Shop by Category
            </Link>
          </div>

          {/* Right: Desktop actions */}
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

        {/* MOBILE MENU (slide from left) */}
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
                id="mobile-menu"
                role="navigation"
                variants={sideMenu}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed top-[60px] left-0 bottom-0 w-64 bg-white shadow-lg p-6 flex flex-col space-y-4 z-50"
              >
                <Link
                  href="/"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/categories"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Shop by Category
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* MOBILE SEARCH OVERLAY */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSearchOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-x-0 top-0 bottom-0 z-50 bg-white flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
                <button
                  className="ml-3 p-2 rounded hover:bg-gray-100"
                  onClick={() => setMobileSearchOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {!!searchResults.length ? (
                  searchResults.map((p) => (
                    <button
                      key={p._id || p.id}
                      className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100"
                    >
                      {p.name}
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="px-4 py-3 text-gray-500">No results found</p>
                ) : (
                  <p className="px-4 py-3 text-gray-400">
                    Type to search products...
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAV */}
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
          <MobileAccountMenu
            me={me}
            setMe={setMe}
            loadingUser={loadingUser}
          />
        </div>
      </div>
    </>
  );
}
