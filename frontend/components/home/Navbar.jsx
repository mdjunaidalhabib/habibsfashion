"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { apiFetch } from "../../utils/api";
import {
  FaShoppingCart,
  FaHeart,
  FaBars,
  FaSearch,
  FaUser,
  FaHome,
  FaThLarge,
} from "react-icons/fa";

const Navbar = () => {
  const { cart, wishlist } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ✅ user state
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Cart count = সব quantity যোগফল
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const wishlistCount = wishlist.length;

  const searchRef = useRef(null);

  // ✅ Load current user
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/auth/me", { credentials: "include" });
        setMe(data);
      } catch {
        setMe(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // ✅ fetch products from backend on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const products = await apiFetch("/api/products");
        const filtered = products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("❌ Search fetch failed", err);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  // ✅ Click outside handler -> clear search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* ----------- TOP NAVBAR ----------- */}
      <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          {/* Left: Menu (mobile only) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-100"
          >
            <FaBars className="w-6 h-6" />
          </button>

          {/* Middle: Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            𝐇𝐚𝐛𝐢𝐛'𝐬 𝐅𝐚𝐬𝐡𝐢𝐨𝐧
          </Link>

          {/* Middle Menu (Desktop only) */}
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

          {/* Right: Search + Account + Cart + Wishlist */}
          <div className="flex items-center gap-4 relative">
            {/* Desktop Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Search products..."
                className="border rounded-lg px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="absolute mt-1 w-64 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-50">
                  {searchResults.slice(0, 6).map((p) => (
                    <Link
                      key={p._id || p.id}
                      href={`/products/${p._id || p.id}`}
                      onClick={() => setSearchQuery("")}
                      className="block px-3 py-2 hover:bg-gray-100"
                    >
                      {p.name}
                    </Link>
                  ))}
                  {!searchResults.length && (
                    <p className="px-3 py-2 text-gray-500">No results found</p>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search toggle */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* ✅ Account Menu */}
            <AccountMenu me={me} setMe={setMe} loadingUser={loadingUser} />

            {/* Cart */}
            <div className="hidden md:block">
              <Link href="/cart" className="relative ">
                <FaShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Wishlist */}
            <div className="hidden md:block">
              <Link href="/wishlist" className="relative">
                <FaHeart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ----------- MOBILE SEARCH ----------- */}
        {mobileSearchOpen && (
          <div
            className="md:hidden bg-white border-t px-4 py-2 shadow relative"
            ref={searchRef}
          >
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-50">
                {searchResults.slice(0, 6).map((p) => (
                  <Link
                    key={p._id || p.id}
                    href={`/products/${p._id || p.id}`}
                    onClick={() => {
                      setSearchQuery("");
                      setMobileSearchOpen(false);
                    }}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    {p.name}
                  </Link>
                ))}
                {!searchResults.length && (
                  <p className="px-4 py-2 text-gray-500">No results found</p>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ----------- MOBILE BOTTOM NAV ----------- */}
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

          <Link
            href="/wishlist"
            className="relative flex flex-col items-center"
          >
            <FaHeart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 right-1 bg-red-500 text-xs text-white px-1.5 rounded-full">
                {wishlistCount}
              </span>
            )}
            <span>Wishlist</span>
          </Link>

          <Link href="/cart" className="relative flex flex-col items-center">
            <FaShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-xs text-white px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
            <span>Cart</span>
          </Link>
        </div>
      </div>

      {/* ----------- MOBILE MENU DRAWER ----------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="relative bg-white w-64 h-full shadow-lg z-50 p-6">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Menu</h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="block hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="block hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Shop by Category
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="block hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="block hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="block hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

// ---------- Account Menu ----------
function AccountMenu({ me, setMe, loadingUser }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loadingUser) {
    return (
      <button className="p-2 rounded text-gray-400 flex items-center gap-1">
        <FaUser className="w-5 h-5" /> Loading...
      </button>
    );
  }

  if (!me) {
    return (
      <button
        onClick={() =>
          (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
        }
        className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
      >
        <FaUser className="w-5 h-5" /> Login
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
      >
        {me.avatar ? (
          <Image
            src={me.avatar}
            alt={me.name}
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <FaUser className="w-5 h-5" />
        )}
        {me.name?.split(" ")[0]}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white shadow rounded w-44 z-50">
          <Link
            href="/profile"
            className="block px-3 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href="/orders"
            className="block px-3 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Orders
          </Link>
          <button
            onClick={async () => {
              await apiFetch("/auth/logout", { method: "POST" });
              setMe(null);
              window.location.href = "/";
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
