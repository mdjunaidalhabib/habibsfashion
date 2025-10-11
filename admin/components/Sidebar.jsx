"use client";

import MenuBar from "./MenuBar";
import { navItems, settingsChildren } from "./menuConfig";

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-60 h-screen p-4 bg-white shadow">
      <MenuBar items={navItems} settingsChildren={settingsChildren} vertical={true} />
    </aside>
  );
}
