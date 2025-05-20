import React from "react";
import Button from "@/components/Button";
import Image from "next/image";

const buttonClassName =
  "w-full py-2 font-medium text-white transition duration-300 bg-pink-600 rounded-md hover:bg-pink-700";

const LoginForm = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100">
      {/* Logo & Judul */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center w-full h-full gap-2">
          <Image
            alt="logo"
            width={1000}
            height={1000}
            src="/assets/logo-108x108.png"
            className="w-[2.5rem] h-full"
          />
          <h1 className="text-2xl text-pink-600 font-gloock-regular">Kembangku</h1>
        </div>
      </div>

      {/* Card Form */}
      <div className="w-full max-w-sm p-6 bg-white rounded-md shadow-md font-geist-regular">
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 font-geist-semi-bold">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 font-geist-semi-bold">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm font-geist-regular focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-center w-full">
            <Button className={buttonClassName}>Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
