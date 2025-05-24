"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";

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
    <div className="fixed left-0 top-[8%] w-[15%] bg-white h-[calc(100vh-80px)] border-r border-gray-200 border-t-0 z-40">
      <div className="flex items-center justify-center gap-1 pt-6 pb-1">
        <Image
          src="/assets/logo-36x36.png"
          alt="logo"
          width={36}
          height={36}
          className="h-5 w-5"
        />
        <h1 className="font-gloock-regular text-xl font-bold">
          <span className="text-pink-500">Kembangku</span>
        </h1>
      </div>

      <nav className="p-4 bg-white">
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
