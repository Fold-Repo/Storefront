import React from "react";
import { cn } from "@/lib";
import Link from "next/link";

export interface NavLinkProps {
  link: string;
  label: string;
  className?: string;
}

export interface LinkGroupProps {
  header: string;
  className?: string;
  children: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({ link, label, className }) => {
  return (
    <li>
      <Link
        href={link}
        className={cn(
          "inline-block text-base leading-loose font-normal text-[#4F4F4F] ",
          className
        )}
      >
        {label}
      </Link>
    </li>
  );
};

export const LinkGroup: React.FC<LinkGroupProps> = ({
  header,
  className,
  children,
}) => {
  return (
    <div className={cn("w-1/2 px-4 sm:w-1/2 lg:w-8/12", className)}>
      <div className="mb-5 w-full">
        <h1 className="mb-5 text-black font-extrabold text-2xl">
          {header}
        </h1>
        <ul className="space-y-3">{children}</ul>
      </div>
    </div>
  );
};
