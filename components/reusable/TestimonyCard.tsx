import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { Avatar } from "@heroui/avatar";

interface TestimonyCardProps {
  text: string;
  author: string;
  location: string;
  avatar: string;
  rating: number; // 1-5
}

export const TestimonyCard: React.FC<TestimonyCardProps> = ({
  text,
  author,
  location,
  avatar,
  rating,
}) => {
  return (
    <div className="shrink-0 w-80 h-64 p-6 bg-neutral-800 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">

      {/* Top Section: Stars + Text */}
      <div>
        {/* Star Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`w-5 h-5 ${
                i < rating ? "text-yellow-400" : "text-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Testimony Text */}
        <p className="text-gray-300 text-sm line-clamp-4">
          {text}
        </p>
      </div>

      {/* Bottom Section: Avatar + Author */}
      <div className="flex items-center gap-3 mt-4">
        <Avatar
          isBordered
          className="transition-transform"
          color="warning"
          name={author}
          size="md"
          src={avatar}
        />

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-white font-sans">{author}</p>
          <p className="text-xs text-gray-400 font-sans">{location}</p>
        </div>
      </div>
    </div>
  );
};
