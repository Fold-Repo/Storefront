import React from "react";
import Image from "next/image";
import Missing from "@/public/img/HomePage/Missing.svg";

export const WhatYouAreMissing = () => {

  return (
    <section className="w-full flex flex-col lg:flex-row items-center gap-15 px-6 py-10">
      {/* Text Section */}
      <div className="text-center lg:text-left">
        <h1 className="font-black_han text-3xl sm:text-4xl leading-tight">
          See what you're missing.
        </h1>

        <p className="font-sans text-base sm:text-lg text-gray-700 mt-4">
          Stop guessing your weak points. TestCube breaks down your performance
          by Topic. We tell you exactly where to focus your energy.
        </p>
      </div>

      {/* Image Section */}
      <div className="flex justify-center w-full lg:w-auto">
        <Image
          src={Missing}
          alt="Train under fire illustration"
          width={704}
          height={480}
          className="w-full max-w-[704px] h-auto"
        />
      </div>
    </section>
  );
};
