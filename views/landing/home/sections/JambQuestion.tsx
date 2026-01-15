import React from 'react'
import Image from 'next/image'
import Quest from "@/public/img/HomePage/Quest.svg";

export const JambQuestion = () => {
  return (
    <div className="flex flex-col items-center text-center w-full px-6 py-10
                    bg-[linear-gradient(180deg,#E6E6FA_0%,#FFF9E6_100%)]">
      <h1 className="font-black_han text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-3xl">
        Can you answer this JAMB Math question?
      </h1>

      <Image
        src={Quest}
        alt="Jamb question"
        className="mt-6 w-full max-w-[600px] h-auto mx-auto"
        priority
      />
    </div>
  );
}
