"use client";
import React from "react";
import { Card, CardBody } from "@heroui/react";
import Button from "@/components/ui/button";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export const Pricing = () => {
  return (
    <div className="my-10 items-center px-6 py-10 w-full bg-[#FAFAFC]">
      <h1 className="font-black_han text-3xl sm:text-4xl lg:text-5xl text-center mb-2">
        Simple, affordable pricing
      </h1>
      <p className="font-sans text-lg text-center">
        Invest in your future for the cost of a lunch
      </p>

      <div className="mt-8 px-10 mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[1300px]">
        {/* Basic Practice Card */}
        <Card className="p-6 border rounded-xl flex flex-col justify-between bg-white/10 border-white/20 h-[500px]">
          <CardBody className="flex flex-col gap-2">
            <p className="text-xl font-sans font-semibold">Basic Practice</p>

            <p className="font-sans font-bold text-[48px] leading-[125%] tracking-[0.2%]">
              ₦0<span className="text-lg font-normal">/month</span>
            </p>

            <div className="flex flex-col gap-3 mt-4 grow">
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-6 h-6 text-blue-500 shrink-0" />
                <p className="font-sans text-base font-normal">
                  1 Full test per month
                </p>
              </span>
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-6 h-6 text-blue-500 shrink-0" />
                <p className="font-sans text-base font-normal">
                  Basic score tracking
                </p>
              </span>
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-6 h-6 text-blue-500 shrink-0" />
                <p className="font-sans text-base font-normal">
                  Monthly performance reports
                </p>
              </span>
            </div>

            <Button
              color="default"
              variant="bordered"
              className="w-full py-3 mt-6 rounded-full border border-neutral-200 font-sans font-medium text-base text-black hover:bg-gray-50"
            >
              Get Started
            </Button>
          </CardBody>
        </Card>

        {/* Ultimate Access Card */}
        <Card className="p-6 border rounded-xl flex flex-col justify-between bg-[#05076D] border-white/20 h-[500px]">
          <CardBody className="flex flex-col gap-2">
            <p className="text-xl font-sans font-medium text-[#B3B4F2]">
              Ultimate Access
            </p>

            <p className="text-3xl sm:text-4xl lg:text-5xl leading-tight text-white font-sans font-bold">
              ₦2,500<span className="text-lg font-normal">/month</span>
            </p>

            <div className="flex flex-col gap-1.5 mt-4 grow text-neutral-200">
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-7 h-7" />
                <p className="font-sans text-base font-normal">
                  Full Access to all Past Question
                </p>
              </span>
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-7 h-7" />
                <p className="font-sans text-base font-normal">
                  Unlimited CBT Mock Tests
                </p>
              </span>
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-7 h-7" />
                <p className="font-sans text-base font-normal">
                  AI-Powered Answer Explanation
                </p>
              </span>
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-7 h-7" />
                <p className="font-sans text-base font-normal">
                  Detailed Performance Analytics
                </p>
              </span>
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-7 h-7" />
                <p className="font-sans text-base font-normal">
                  Monthly performance reports
                </p>
              </span>
              <span className="flex items-center gap-2">
                <IoMdCheckmarkCircleOutline className="w-7 h-7" />
                <p className="font-sans text-base font-normal">
                  Priority Support
                </p>
              </span>
            </div>

            <Button
              color="primary"
              className="w-full py-3 mt-6 rounded-full font-sans font-medium text-base text-white bg-linear-to-r from-[#8082EA] to-[#4D4FE1] hover:from-[#6f71d9] hover:to-[#3e49c8] transition-colors"
            >
              Get Started
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
