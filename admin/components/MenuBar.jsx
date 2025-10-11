"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuBar({ items, settingsChildren = [], onItemClick, vertical = true }) {
  const pathname = usePathname();
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    if (pathname && pathname.startsWith("/settings")) setOpenSettings(true);
  }, [pathname]);

  return (
    <nav className={`${vertical ? "flex-col space-y-1" : "flex-row space-x-2"} flex`}>
      {items.map(({ icon, label, href }) => {
        if (label === "Settings") {
          const parentActive = pathname.startsWith("/settings");

          return (
            <div key="settings" className="w-full">
              <button
                onClick={() => setOpenSettings((s) => !s)}
                aria-expanded={openSettings}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded transition ${
                  parentActive ? "bg-gray-200 font-semibold text-blue-600" : "hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  {icon}
                  <span>{label}</span>
                </span>
                <ChevronDown
                  className={`transition-transform ${openSettings ? "rotate-180" : "rotate-0"}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-1 flex flex-col overflow-hidden"
                  >
                    {settingsChildren.map(({ icon: cIcon, label: cLabel, href: cHref }) => {
                      const active = pathname === cHref;
                      return (
                        <Link
                          key={cLabel}
                          href={cHref}
                          onClick={onItemClick}
                          className={`flex items-center gap-2 ml-6 px-4 py-2 rounded transition text-sm ${
                            active ? "bg-gray-200 font-semibold text-blue-600" : "hover:bg-gray-100"
                          }`}
                        >
                          {cIcon}
                          <span>{cLabel}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            onClick={onItemClick}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              active ? "bg-gray-200 font-semibold text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
