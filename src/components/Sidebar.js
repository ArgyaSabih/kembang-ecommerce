"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
    { path: "/admin/products", label: "Products", icon: ShoppingBagIcon },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: RectangleStackIcon,
    },
  ];

  return (
    <div className="w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-200">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
