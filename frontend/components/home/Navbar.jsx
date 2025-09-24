"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

// ✅ Small debounce helper
const useDebouncedValue = (value, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const Navbar = () => {
  const router = useRouter();
  const { cart = {}, wishlist = [] } = useCart() || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 350);
  const [searchResults, setSearchResults] = useState([]);

  // ✅ user state
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Cart count = সব quantity যোগফল
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + (qty || 0), 0);
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

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

  // ✅ fetch products from backend on debounced query
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const products = await apiFetch("/api/products");
        const filtered = products
          .filter((p) =>
            String(p?.name || "").toLowerCase().includes(q.toLowerCase())
          )
          .slice(0, 20);
        if (!cancelled) setSearchResults(filtered);
      } catch (err) {
        console.error("❌ Search fetch failed", err);
        if (!cancelled) setSearchResults([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // ✅ Click outside handler -> close dropdown only (query keep)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProduct = useCallback(
    (id) => {
      setSearchResults([]);
      setSearchQuery("");
      setMobileSearchOpen(false);
      router.push(`/products/${id}`);
    },
    [router]
  );

  return (
    <>
      {/* ----------- TOP NAVBAR ----------- */}
      <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          {/* Left: Menu (mobile only) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-100"
            aria-label="Toggle menu"
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
              {!!searchResults.length && (
                <div className="absolute mt-1 w-64 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-50">
                  {searchResults.slice(0, 6).map((p) => (
                    <button
                      key={p._id || p.id}
                      onClick={() => goToProduct(p._id || p.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              {debouncedQuery && !searchResults.length && (
                <div className="absolute mt-1 w-64 bg-white shadow-lg rounded-lg z-50">
                  <p className="px-3 py-2 text-gray-500">No results found</p>
                </div>
              )}
            </div>

            {/* Mobile Search toggle */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Open search"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* ✅ Account Menu: Desktop only */}
            <div className="hidden md:block">
              <AccountMenu me={me} setMe={setMe} loadingUser={loadingUser} />
            </div>

            {/* Cart */}
            <div className="hidden md:block">
              <Link href="/cart" className="relative">
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
            {!!searchResults.length && (
              <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-50">
                {searchResults.slice(0, 6).map((p) => (
                  <button
                    key={p._id || p.id}
                    onClick={() => goToProduct(p._id || p.id)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            {debouncedQuery && !searchResults.length && (
              <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-50">
                <p className="px-4 py-2 text-gray-500">No results found</p>
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

          {/* ✅ Account for Mobile */}
          <MobileAccountMenu me={me} setMe={setMe} loadingUser={loadingUser} />
        </div>
      </div>
    </>
  );
};

export default Navbar;

// ---------- Account Menu (Desktop dropdown) ----------
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
      <button className="p-2 rounded text-gray-400 flex items-center gap-1" disabled>
        <FaUser className="w-5 h-5" /> Loading...
      </button>
    );
  }

  if (!me) {
    return (
      <button
        onClick={() => {
          const currentUrl = window.location.href;
          window.location.href = `${
            process.env.NEXT_PUBLIC_AUTH_API_URL
          }/auth/google?redirect=${encodeURIComponent(currentUrl)}`;
        }}
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
        <div className="absolute right-0 mt-2 w-56 bg-white shadow rounded z-50">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-3 border-b">
            {me.avatar ? (
              <Image
                src={me.avatar}
                alt={me.name}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <FaUser className="w-6 h-6" />
            )}
            <span className="font-medium truncate">{me.name}</span>
          </div>

          {/* Menu Links */}
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
              try {
                await apiFetch("/auth/logout", { method: "POST", credentials: "include" });
              } finally {
                setMe(null);
                window.location.href = "/";
              }
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

// ---------- Mobile Account Menu (Fullscreen Drawer) ----------
function MobileAccountMenu({ me, setMe, loadingUser }) {
  const [open, setOpen] = useState(false);

  if (loadingUser) {
    return (
      <button className="flex flex-col items-center text-gray-400" disabled>
        <FaUser className="w-5 h-5" />
        <span>Account</span>
      </button>
    );
  }

  if (!me) {
    return (
      <button
        onClick={() => {
          const currentUrl = window.location.href;
          window.location.href = `${
            process.env.NEXT_PUBLIC_AUTH_API_URL
          }/auth/google?redirect=${encodeURIComponent(currentUrl)}`;
        }}
        className="flex flex-col items-center"
      >
        <FaUser className="w-5 h-5" />
        <span>Account</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center"
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
        <span>Account</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-full h-full p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100"
              aria-label="Close account menu"
            >
              ✕
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              {me.avatar ? (
                <Image
                  src={me.avatar}
                  alt={me.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <FaUser className="w-8 h-8" />
              )}
              <span className="font-medium text-lg truncate">{me.name}</span>
            </div>

            {/* Menu Links */}
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
                try {
                  await apiFetch("/auth/logout", { method: "POST", credentials: "include" });
                } finally {
                  setMe(null);
                  window.location.href = "/";
                }
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
