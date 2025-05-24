"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    // nanti diisi
  };

  return (
    <div className="bg-white p-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h1 className="font-gloock-regular font-bold text-xl">
          <span className="text-gray-800 ml-1">Admin</span>
        </h1>
        <div className="flex items-center gap-0.8">
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
      </div>
      <div className="flex items-center">
        <div className="relative mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-pink-500"></span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold mr-2 hover:bg-pink-200 transition-colors">
              A
            </div>
            <span className="text-gray-800">Admin</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
