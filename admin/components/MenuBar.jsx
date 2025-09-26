"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuBar({ items, onItemClick, vertical = true }) {
  const pathname = usePathname();

  return (
    <nav className={`${vertical ? "flex-col space-y-1" : "flex-row space-x-2"} flex`}>
      {items.map(({ icon, label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            onClick={onItemClick}
            className={`flex items-center gap-2 px-4 py-2 rounded transition
              ${active ? "bg-gray-200 font-semibold text-blue-600" : "hover:bg-gray-100"}
            `}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
