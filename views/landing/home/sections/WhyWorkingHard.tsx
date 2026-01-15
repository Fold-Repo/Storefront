import Image from "next/image";
import Frame16 from "@/public/img/HomePage/Frame16.svg";
import { XMarkIcon } from "@heroicons/react/24/solid";
import React from "react";

export const WhyWorkingHard = () => {
  return (
    <section className="flex flex-col sm:flex-row items-center justify-between gap-10 mt-16 px-6 py-10 bg-[#E6E6FA] rounded-2xl">
      {/* TEXT SECTION */}
      <div className="text-center sm:text-left max-4w-lg">
        <h1 className="font-black_han text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
          Why “working hard” isn’t enough.
        </h1>

        <p className="text-base sm:text-lg text-gray-700 mb-3">
          You read the textbooks. You attended the extra classes. But on exam
          day, anxiety hits.
        </p>

        {/* Vertical line accent */}
        <h3 className="text-lg sm:text-xl font-sans font-medium border-l-4 border-blue-500 pl-4 leading-relaxed">
          Why?
          <br />
          Because you practiced content, but you didn’t practice the conditions.
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="flex flex-col items-start gap-3">
            <span className="flex gap-2 items-center">
              <XMarkIcon className="h-6 w-6 text-[#DC3545]" />
              <h4>Unfamiliar CBT Interfaces</h4>
            </span>
            <span className="flex gap-2 items-center">
              <XMarkIcon className="h-6 w-6 text-[#DC3545]" />
              <h4>Focusing on the wrong topics</h4>
            </span>
          </div>
          <div>
            <span className="flex gap-2 items-center">
              <XMarkIcon className="h-6 w-6 text-[#DC3545]" />
              <h4>Poor Time Management</h4>
            </span>
          </div>
        </div>
      </div>

      {/* IMAGE SECTION */}
      <div>
        <Image
          src={Frame16}
          alt="Thinking boy"
          className="w-full h-auto bg-blend-multiply"
        
        />
      </div>
    </section>
  );
};
