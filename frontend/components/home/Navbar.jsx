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
  FaSearch,
  FaUser,
  FaHome,
  FaThLarge,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Small debounce helper
const useDebouncedValue = (value, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

// ✅ Animation Variants
const sideMenu = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};
const topBar = { open: { rotate: 45, y: 10 }, closed: { rotate: 0, y: 0 } };
const middleBar = { open: { opacity: 0 }, closed: { opacity: 1 } };
const bottomBar = { open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } };

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

  // ✅ Cart count
  const cartCount = Object.values(cart).reduce(
    (sum, qty) => sum + (qty || 0),
    0
  );
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  const searchRef = useRef(null);

  // ✅ Load current user (JWT)
  useEffect(() => {
    (async () => {
      try {
        // প্রথমে localStorage থেকে নাও
        const cachedUser =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (cachedUser) {
          setMe(JSON.parse(cachedUser));
          setLoadingUser(false);
        }

        // backend verify
        const data = await apiFetch("/auth/me");
        if (data?.user) {
          setMe(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        setMe(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // ✅ fetch products
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
      } catch {
        if (!cancelled) setSearchResults([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // ✅ Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ ESC চাপলে মেনু বন্ধ
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ✅ মেনু খোলা থাকলে scroll lock
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  const goToProduct = useCallback(
    (id) => {
      setSearchResults([]);
      setSearchQuery("");
      setMobileSearchOpen(false);
      router.push(`/products/${id}`);
    },
    [router]
  );

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMe(null);
    window.location.href = "/";
  };

  return (
    <>
      {/* ----------- TOP NAVBAR ----------- */}
      <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-3 px-4">
          {/* Left: Hamburger (animated) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-[5px] z-50"
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

          {/* Middle: Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            𝐇𝐚𝐛𝐢𝐛'𝐬 𝐅𝐚𝐬𝐡𝐢𝐨𝐧
          </Link>

          {/* Middle Menu (Desktop only) */}
          <div className="hidden md:flex items-center gap-6 font-medium">
            <Link href="/">Home</Link>
            <Link href="/products">All Products</Link>
            <Link href="/categories">Shop by Category</Link>
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
            </div>

            {/* Mobile Search toggle */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* ✅ Account Menu: Desktop */}
            <div className="hidden md:block">
              <AccountMenu me={me} setMe={setMe} loadingUser={loadingUser} onLogout={handleLogout} />
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

        {/* ----------- MOBILE MENU (with animation) ----------- */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              variants={sideMenu}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="fixed top-[52px] left-0 bottom-0 w-64 bg-white shadow-lg p-6 flex flex-col space-y-4 z-50"
            >
              <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/products" onClick={() => setMenuOpen(false)}>All Products</Link>
              <Link href="/categories" onClick={() => setMenuOpen(false)}>Shop by Category</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ----------- MOBILE BOTTOM NAV ----------- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
        <div className="flex justify-around items-center py-2 text-sm">
          <Link href="/" className="flex flex-col items-center">
            <FaHome className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/categories" className="flex flex-col items-center">
            <FaThLarge className="w-5 h-5" />
            <span>Category</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center">
            <FaHeart className="w-5 h-5" />
            <span>Wishlist</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center">
            <FaShoppingCart className="w-5 h-5" />
            <span>Cart</span>
          </Link>
          <MobileAccountMenu me={me} setMe={setMe} loadingUser={loadingUser} onLogout={handleLogout} />
        </div>
      </div>
    </>
  );
};

export default Navbar;

// ---------- Account Menu (Desktop dropdown) ----------
function AccountMenu({ me, setMe, loadingUser, onLogout }) {
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
    return <button className="p-2 text-gray-400">Loading...</button>;
  }

  if (!me) {
    return (
      <button
        onClick={() => {
          const currentUrl = window.location.href;
          window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${encodeURIComponent(currentUrl)}`;
        }}
        className="p-2 flex items-center gap-1"
      >
        <FaUser /> Login
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 flex items-center gap-1">
        {me.avatar ? <Image src={me.avatar} alt={me.name} width={28} height={28} className="rounded-full" /> : <FaUser />}
        {me.name?.split(" ")[0]}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow rounded z-50">
          <Link href="/profile" className="block px-3 py-2">My Profile</Link>
          <Link href="/orders" className="block px-3 py-2">My Orders</Link>
          <button onClick={onLogout} className="w-full text-left px-3 py-2">Logout</button>
        </div>
      )}
    </div>
  );
}

// ---------- Mobile Account Menu (Fullscreen Drawer) ----------
function MobileAccountMenu({ me, setMe, loadingUser, onLogout }) {
  const [open, setOpen] = useState(false);

  if (loadingUser) {
    return <button className="flex flex-col items-center text-gray-400"><FaUser /><span>Account</span></button>;
  }

  if (!me) {
    return (
      <button
        onClick={() => {
          const currentUrl = window.location.href;
          window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${encodeURIComponent(currentUrl)}`;
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
      <button onClick={() => setOpen(true)} className="flex flex-col items-center">
        {me.avatar ? <Image src={me.avatar} alt={me.name} width={28} height={28} className="rounded-full" /> : <FaUser className="w-5 h-5" />}
        <span>Account</span>
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3 }} className="bg-white w-full h-full p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3">✕</button>
            <div className="mb-6 border-b pb-4">{me.name}</div>
            <Link href="/profile" className="block px-3 py-2">My Profile</Link>
            <Link href="/orders" className="block px-3 py-2">My Orders</Link>
            <button onClick={onLogout} className="w-full text-left px-3 py-2 mt-4">Logout</button>
          </motion.div>
        </div>
      )}
    </>
  );
}
