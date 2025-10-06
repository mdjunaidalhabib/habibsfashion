"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Debounce hook
const useDebouncedValue = (value, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

export default function SearchBox({ mobileSearchOpen, setMobileSearchOpen }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 350);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const desktopRef = useRef(null);

  // ✅ Navigate to product page
  const goToProduct = useCallback(
    (id) => {
      setSearchResults([]);
      setSearchQuery("");
      setMobileSearchOpen(false);
      router.push(`/products/${id}`);
    },
    [router, setMobileSearchOpen]
  );

  // ✅ Fetch product data with debounce
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const products = await res.json();

        const filtered = products
          .filter((p) =>
            String(p?.name || "").toLowerCase().includes(q.toLowerCase())
          )
          .slice(0, 20);

        if (!cancelled) setSearchResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <>
      {/* 🖥️ Desktop search box */}
      <div className="hidden md:block relative" ref={desktopRef}>
        <input
          type="text"
          placeholder="Search products..."
          className="border rounded-lg px-3 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* ✅ Desktop search result dropdown */}
        <AnimatePresence>
          {!!searchResults.length && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute mt-1 w-64 bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto z-50"
            >
              {searchResults.map((p) => (
                <button
                  key={p._id || p.id}
                  onClick={() => goToProduct(p._id || p.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  {p.name}
                </button>
              ))}
            </motion.div>
          )}

          {/* No results */}
          {debouncedQuery && !searchResults.length && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute mt-1 w-64 bg-white shadow-lg rounded-lg z-50"
            >
              <p className="px-3 py-2 text-gray-500">No results found</p>
            </motion.div>
          )}

          {/* Loading state */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute mt-1 w-64 bg-white shadow-lg rounded-lg z-50"
            >
              <p className="px-3 py-2 text-gray-500">Searching...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📱 Mobile search icon */}
      <button
        type="button"
        className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setMobileSearchOpen(true)}
        aria-label="Open search"
      >
        <FaSearch className="w-5 h-5" />
      </button>

      {/* ✅ Mobile fullscreen overlay */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            {/* Dark backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 top-0 z-50 bg-white flex flex-col"
            >
              {/* Header with input */}
              <div className="flex items-center justify-between p-4 border-b">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="ml-3 p-2 rounded hover:bg-gray-100"
                  onClick={() => setMobileSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search results */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <p className="px-4 py-3 text-gray-500">Searching...</p>
                ) : !!searchResults.length ? (
                  searchResults.map((p) => (
                    <button
                      key={p._id || p.id}
                      onClick={() => goToProduct(p._id || p.id)}
                      className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100"
                    >
                      {p.name}
                    </button>
                  ))
                ) : debouncedQuery ? (
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
    </>
  );
}
