"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { useUser } from "../../context/UserContext";

export default function AccountMenuDesktop() {
  const { me, setMe, loadingUser } = useUser();
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
        <FaUser /> Loading...
      </button>
    );
  }

  if (!me) {
    return (
      <button
        onClick={() => {
          const currentUrl = window.location.href;
          window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${encodeURIComponent(
            currentUrl
          )}`;
        }}
        className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
      >
        <FaUser /> Login
      </button>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ শুধু token মুছবে
    setMe(null);
    window.location.href = "/";
  };

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
          <Link href="/profile" className="block px-3 py-2 hover:bg-gray-100">
            My Profile
          </Link>
          <Link href="/orders" className="block px-3 py-2 hover:bg-gray-100">
            My Orders
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
