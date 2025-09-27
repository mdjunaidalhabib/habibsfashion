"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ animation
import { apiFetch } from "../../utils/api";

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

  const desktopRef = useRef(null);

  // ✅ Navigate to product
  const goToProduct = useCallback(
    (id) => {
      setSearchResults([]);
      setSearchQuery("");
      setMobileSearchOpen(false);
      router.push(`/products/${id}`);
    },
    [router, setMobileSearchOpen]
  );

  // ✅ Fetch products
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

  return (
    <>
      {/* Desktop search */}
      <div className="hidden md:block relative" ref={desktopRef}>
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
        onClick={() => setMobileSearchOpen(true)}
        aria-label="Open search"
      >
        <FaSearch className="w-5 h-5" />
      </button>

      {/* ✅ Mobile fullscreen overlay with backdrop */}
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
              onClick={() => setMobileSearchOpen(false)} // backdrop click close
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-x-0 bottom-0 top-0 z-50 bg-white flex flex-col"
            >
              {/* Header with Close button */}
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
                  className="ml-3 p-2 rounded hover:bg-gray-100"
                  onClick={() => setMobileSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {!!searchResults.length ? (
                  searchResults.slice(0, 20).map((p) => (
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
