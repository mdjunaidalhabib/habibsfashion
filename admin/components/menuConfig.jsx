import {
  CircleGauge,
  Users,
  Package,
  ShoppingCart,
  ChartBarStacked,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";

export const navItems = [
  { icon: <CircleGauge size={18} />, label: "Dashboard", href: "/" },
  { icon: <ShoppingCart size={18} />, label: "Orders", href: "/orders" },
  { icon: <Package size={18} />, label: "Products", href: "/products" },
  { icon: <ChartBarStacked size={18} />, label: "Category", href: "/category" },
  { icon: <Users size={18} />, label: "Users", href: "/users" },
  { icon: <CreditCard size={18} />, label: "Payments", href: "/payments" },
  { icon: <Bell size={18} />, label: "Notifications", href: "/notifications" },
  { icon: <Settings size={18} />, label: "Settings", href: "/settings" },
];
