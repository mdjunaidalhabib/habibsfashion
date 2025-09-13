"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { apiFetch } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

// Skeleton for loading ProductCard
const ProductCardSkeleton = () => (
  <div className="bg-white shadow-md p-3 rounded-lg animate-pulse flex flex-col">
    <div className="h-40 sm:h-48 md:h-52 bg-gray-200 rounded-lg mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="mt-auto h-10 bg-gray-200 rounded"></div>
  </div>
);

// Utility: group products by category id
const groupByCategory = (all, catId) => all.filter((p) => p.category === catId);

// CategoryRow: reusable slider per category
const CategoryRow = ({ category, items, autoPlayMs = 3000, loading }) => {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const [slidesPerView, setSlidesPerView] = useState(2);

  // slides per view from viewport width
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) return 2;
      if (w < 1024) return 3;
      return 4;
    };
    const apply = () => setSlidesPerView(calc());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // extended list for looping autoplay
  const extended = useMemo(() => {
    if (!items || items.length === 0) return [];
    const minLen = items.length + slidesPerView * 2;
    const out = [];
    let i = 0;
    while (out.length < minLen) {
      out.push(items[i % items.length]);
      i++;
    }
    return out;
  }, [items, slidesPerView]);

  // autoplay
  useEffect(() => {
    if (!extended.length || !autoPlayMs) return;
    const id = setInterval(() => setIndex((i) => i + 1), autoPlayMs);
    return () => clearInterval(id);
  }, [extended.length, autoPlayMs]);

  // reset index if overflow
  useEffect(() => {
    if (!extended.length) return;
    const maxSafe = items.length + slidesPerView;
    if (index > maxSafe) {
      const normalized = ((index % items.length) + items.length) % items.length;
      setEnableTransition(false);
      setIndex(normalized);
      requestAnimationFrame(() => setEnableTransition(true));
    }
  }, [index, extended.length, items.length, slidesPerView]);

  // pointer swipe
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const deltaXRef = useRef(0);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    deltaXRef.current = 0;
    setEnableTransition(false);
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    deltaXRef.current = e.clientX - startXRef.current;
    if (e.pointerType !== "mouse") e.preventDefault();
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    const dx = deltaXRef.current;
    draggingRef.current = false;
    setEnableTransition(true);

    const el = trackRef.current;
    const width = el ? el.clientWidth : 1;
    const threshold = (width / slidesPerView) * 0.25;

    if (Math.abs(dx) >= threshold) {
      if (dx < 0) setIndex((i) => i + 1);
      else setIndex((i) => Math.max(0, i - 1));
    }
    deltaXRef.current = 0;
  };

  const basePercent = -(index * (100 / slidesPerView));
  const dragPercent = () => {
    if (!draggingRef.current) return 0;
    const el = trackRef.current;
    const width = el ? el.clientWidth : 1;
    return (deltaXRef.current / width) * 100;
  };
  const transform = `translateX(calc(${basePercent}% + ${dragPercent()}%))`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold">
          {loading ? (
            <span className="bg-gray-200 h-6 w-32 rounded animate-pulse inline-block"></span>
          ) : (
            category.name
          )}
        </h2>
        {!loading && category.id && (
          <Link
            href={`/categories/${category.id}`}
            className="text-blue-600 hover:underline text-sm sm:text-base"
          >
            View all
          </Link>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-full select-none touch-pan-y"
          style={{
            transform,
            transition: enableTransition ? "transform 450ms ease" : "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {loading || !items.length
            ? Array.from({ length: slidesPerView * 2 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 px-2"
                  style={{ width: `${100 / slidesPerView}%` }}
                >
                  <ProductCardSkeleton />
                </div>
              ))
            : extended.map((prod, i) => (
                <div
                  key={`${prod._id || prod.id}-${i}`}
                  className="shrink-0 px-2"
                  style={{ width: `${100 / slidesPerView}%` }}
                >
                  <ProductCard product={prod} />
                </div>
              ))}
        </div>
      </div>
    </motion.section>
  );
};

// Custom autoplay speed
const speedByCategory = {
  electronics: 2500,
  fashion: 3200,
  home: 4000,
};

export default function HomeCategorySections() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch products + categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          apiFetch("/api/products"),
          apiFetch("/api/categories"),
        ]);
        setProducts(pRes);
        setCategories(cRes);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch products or categories", err);
        // ⚠️ Error হলে loading true রাখব → skeleton সবসময় দেখাবে
        setLoading(true);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {loading
          ? // সবসময় placeholder sections
            Array.from({ length: 3 }).map((_, i) => (
              <CategoryRow key={i} category={{ name: "" }} items={[]} loading />
            ))
          : categories.map((cat) => {
              const items = groupByCategory(products, cat.id);
              return (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  items={items}
                  autoPlayMs={speedByCategory[cat.id] ?? 3000}
                  loading={false}
                />
              );
            })}
      </AnimatePresence>
    </div>
  );
}
