import React from "react";
import Image from "next/image";
import Frame81 from "@/public/img/HomePage/Frame81.svg";


export const GrowWithFriends = () => {
  return (
    <section className="w-full flex flex-col lg:flex-row items-center gap-15 px-6 py-10">
      {/* Image Section */}
      <div className="flex justify-center w-full lg:w-auto">
        <Image
          src={Frame81}
          alt="Train under fire illustration"
          width={704}
          height={480}
          className="w-full max-w-[704px] h-auto"
        />
      </div>

      {/* Text Section */}
      <div className="text-center lg:text-left max-w-2xl">
        <h1 className="font-black_han text-3xl sm:text-4xl  leading-tight">
          Grow with friends
        </h1>

        <p className="font-sans text-base sm:text-lg text-gray-700 mt-4">
          Studying is lonely. Competing is addictive. Earn XP, maintain your
          daily streak, and climb the Local & National Leaderboards.
        </p>
      </div>
    </section>
  );
};
