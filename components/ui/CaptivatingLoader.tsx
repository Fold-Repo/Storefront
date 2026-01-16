"use client";

import React, { useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";

interface CaptivatingLoaderProps {
    loadingTexts?: string[];
    subText?: string;
    className?: string;
}

const DEFAULT_TEXTS = [
    "Analyzing your request...",
    "Gathering design inspiration...",
    "Crafting unique elements...",
    "Polishing the details...",
    "Almost there...",
];

export const CaptivatingLoader: React.FC<CaptivatingLoaderProps> = ({
    loadingTexts = DEFAULT_TEXTS,
    subText = "This may take a few seconds",
    className = "",
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [loadingTexts.length]);

    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            {/* Animated Icon */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border-2 border-blue-100">
                    <SparklesIcon className="w-8 h-8 text-blue-600 animate-spin-slow" />
                </div>

                {/* Orbiting particles */}
                <div className="absolute inset-0 animate-spin-custom">
                    <div className="absolute top-0 left-1/2 -ml-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
            </div>

            {/* Main Text with Fade Animation */}
            <h3 className="text-xl font-semibold text-neutral-800 mb-2 min-h-[28px] transition-all duration-500">
                {loadingTexts[currentTextIndex]}
            </h3>

            {/* Subtext */}
            <p className="text-sm text-neutral-500">{subText}</p>

            {/* Progress Bar */}
            <div className="w-48 h-1.5 bg-neutral-100 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-progress-indeterminate"></div>
            </div>

            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes spin-custom {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-custom {
          animation: spin-custom 2s linear infinite;
        }
        @keyframes progress-indeterminate {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 30%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};
