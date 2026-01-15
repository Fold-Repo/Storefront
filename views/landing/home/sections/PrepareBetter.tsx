import React from "react";
import { Chip } from "@heroui/chip";
import styles from "./PrepareBetter.module.css";
import { Button } from "@/components";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export const PrepareBetter = () => {
  const buttonText1 = "Start Practicing for Free";
  const buttonText2 = "View the Demo";

  return (
    <div
      className={`${styles.section} w-full py-6 sm:py-10 lg:py-14 grid place-items-center`}
    >
      <Chip className="bg-[#E6E6FA66] text-primary-400 font-medium text-xs sm:text-sm inline-flex items-center mt-4">
        <span
          className="inline-block w-2 h-2 rounded-full bg-current mr-2"
          aria-hidden="true"
        />
        New: 2024 Past Questions Added
      </Chip>

      <div className="mt-3 text-center font-black_han text-3xl sm:text-4xl lg:text-5xl leading-tight">
        <h1>
          Prepare Better. Perform Better
          <br />
          <span className={styles.gradientText}>WAEC, JAMB & IELTS</span>
          <br />
          Made Simple
        </h1>
      </div>

      <div className="mt-4 max-w-xl sm:max-w-4xl text-center text-sm sm:text-base lg:text-lg text-gray-700">
        <p className="font-sans font-normal text-xl sm:text-lg lg:text-xl ">
          Join over 10,000 Nigerian learners using TestCube to prepare with
          confidence for WAEC, JAMB, and IELTS. Access unlimited past questions,
          smart analytics, and clear performance tracking — all designed to
          predict scores, reveal weaknesses, and guide meaningful improvement.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-5 sm:mt-6 w-full px-4 sm:w-auto justify-center">
        <Button className="w-full sm:w-auto px-6 py-4 bg-yellow-400 hover:bg-yellow-500 rounded-full font-sans font-medium text-sm sm:text-base flex items-center justify-center gap-2">
          {buttonText1}
          <ArrowRightIcon className="h-5 w-5" />
        </Button>

        <Button className="w-full sm:w-auto px-6 py-4 bg-white border-2 border-neutral-200 rounded-full font-sans font-medium text-sm sm:text-base shadow-md hover:shadow-lg text-black">
          {buttonText2}
        </Button>
      </div>
    </div>
  );
};
