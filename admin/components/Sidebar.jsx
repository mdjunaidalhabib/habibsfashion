"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // ← এখানে { } ব্যবহার করো
import Cookies from "js-cookie";

import MenuBar from "./MenuBar";
import { navItems, settingsChildren } from "./menuConfig";
import LogoutButton from "./LogoutButton";

export default function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get("admin_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        });
      } catch (err) {
        console.error("Token decode failed:", err);
      }
    }
  }, []);

  return (
    <aside className="hidden md:flex flex-col justify-between w-60 h-screen p-4 bg-white shadow-lg">
      <div>
        {user && (
          <div className="flex flex-col items-center mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold uppercase mb-2">
              {user.name ? user.name[0] : "A"}
            </div>
            <div className="font-semibold text-lg">{user.name}</div>
            <div className="text-xs opacity-80">{user.email}</div>
            <div className="text-xs mt-1 uppercase bg-white/25 px-2 py-0.5 rounded-full">
              {user.role}
            </div>
          </div>
        )}

        <MenuBar
          items={navItems}
          settingsChildren={settingsChildren}
          vertical={true}
        />
      </div>

      <LogoutButton />
    </aside>
  );
}
