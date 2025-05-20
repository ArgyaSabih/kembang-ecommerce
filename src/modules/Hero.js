import React from "react";
import Button from "@/components/Button";
import Image from "next/image";

const buttonClassName =
  "px-5 py-2 font-medium text-white transition duration-300 bg-pink-600 rounded-md hover:bg-pink-700";

const Hero = () => {
  return (
    <section className="relative w-full h-[90vh] md:h-screen flex items-center justify-start">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/beranda/bg-hero.webp"
          alt="Hero Background"
          fill
          className="object-cover object-center brightness-50"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 text-white md:px-16">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          Hadiah Kecil,
          <br />
          Kesan yang Abadi
        </h1>
        <p className="mt-4 text-sm font-light md:text-base">
          Bahasa emosi dalam wangi dan makna,
          <br />
          sederhana namun bermakna
        </p>
        <div className="mt-6">
          <Button className={buttonClassName}>Lihat Koleksi</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
