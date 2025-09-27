"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../ConfirmModal";
import { useUser } from "../../context/UserContext";

export default function AccountMenuMobile() {
  const { me, setMe, loadingUser } = useUser();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      <>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex flex-col items-center"
        >
          <FaUser className="w-5 h-5" />
          <span>Login</span>
        </button>

        <ConfirmModal
          open={confirmOpen}
          message="আপনি কি Google দিয়ে লগইন করতে চান?"
          onConfirm={() => {
            const currentUrl = window.location.href;
            window.location.href =
              `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/google?redirect=${encodeURIComponent(
                currentUrl
              )}`;
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMe(null);
    window.location.href = "/";
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex flex-col items-center">
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

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 bg-black/50 z-50 flex">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="bg-white w-full h-full p-6 relative"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100"
                aria-label="Close account menu"
              >
                ✕
              </button>

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
                <span className="font-medium text-lg truncate">
                  {me.name}
                </span>
              </div>

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
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 mt-4"
              >
                Logout
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
