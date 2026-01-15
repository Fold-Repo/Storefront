import React from "react";
import Image from "next/image";
import Rectangle8 from "@/public/img/HomePage/Rectangle8.png";
import Rectangle9 from "@/public/img/HomePage/Rectangle-9.png";
import Rectangle10 from "@/public/img/HomePage/Rectangle-10.png";
import Rectangle11 from "@/public/img/HomePage/Rectangle-11.png";
import Rectangle12 from "@/public/img/HomePage/Rectangle-12.png";
import Rectangle13 from "@/public/img/HomePage/Rectangle-13.png";
import Rectangle14 from "@/public/img/HomePage/Rectangle-14.png";
import Rectangle15 from "@/public/img/HomePage/Rectangle-15.png";
import Rectangle16 from "@/public/img/HomePage/Rectangle-16.png";
import Rectangle17 from "@/public/img/HomePage/Rectangle-17.png";

const BrandImages = [
  Rectangle8,
  Rectangle9,
  Rectangle10,
  Rectangle11,
  Rectangle12,
  Rectangle13,
  Rectangle14,
  Rectangle15,
  Rectangle16,
  Rectangle17,
];

export const TrustedByStudent = () => {
    return (
      <div className="w-full h-full py-10 bg-white">
        <h2 className="text-center text-lg font-sans font-normal uppercase mb-6 text-gray-600">
          Trusted by Students Aiming for:
        </h2>

        {/* Carousel Container */}
        <div className="overflow-hidden w-full">
          <div className="flex items-center gap-8 animate-scroll">
            {BrandImages.concat(BrandImages).map((img, index) => (
              <div
                key={index}
                className="transition-all grayscale hover:grayscale-0"
              >
                <Image
                  src={img}
                  alt="trusted by students"
                  width={100}
                  height={100}
                  className="w-[100px] h-[100px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};
