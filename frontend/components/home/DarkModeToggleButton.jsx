"use client";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      // ডিফল্ট লাইট মোড হবে যদি localStorage এ কিছু না থাকে বা 'light' থাকে
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light"); // localStorage-এ সেভ করলাম light
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark"); // localStorage-এ সেভ করলাম dark
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="relative ml-auto px-2 py-2 text-white rounded-xl hover:bg-gray-700 transition-all z-50 flex items-center space-x-2"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
    </button>
  );
}
