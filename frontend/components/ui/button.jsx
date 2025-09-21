"use client";

export function Button({ children, onClick, variant = "default", size = "md", className = "" }) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none";

  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
