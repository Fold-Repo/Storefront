import React from "react";
import Image from "next/image";
import Train from "@/public/img/HomePage/Train16.svg";
import { Button } from "@/components";

export const TrainUnderFire = () => {
  const buttonText = "Try Simulator";

  return (
    <section className="w-full flex flex-col lg:flex-row items-center gap-10 px-6 py-10">
      {/* Image Section */}
      <div className="flex justify-center w-full lg:w-auto">
        <Image
          src={Train}
          alt="Train under fire illustration"
          width={704}
          height={480}
          className="w-full max-w-[704px] h-auto"
        />
      </div>

      {/* Text Section */}
      <div className="text-center lg:text-left">
        <h1 className="font-black_han text-3xl sm:text-4xl leading-tight">
          Train under fire.
        </h1>

        <p className="font-sans text-base sm:text-lg text-gray-700 mt-4">
          Our CBT engine mimics the exact interface of JAMB and WAEC. Same timer
          logic, same question formats, same pressure.
        </p>

        <Button
          color="default"
          variant="bordered"
          className="w-full sm:w-auto px-6 py-3 mt-6 rounded-full border-2 border-neutral-200 font-sans font-medium text-base text-black hover:bg-gray-50 shadow-md hover:shadow-lg"
        >
          {buttonText}
        </Button>
      </div>
    </section>
  );
};
