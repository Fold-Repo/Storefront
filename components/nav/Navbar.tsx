"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";
import { Button } from "../ui";
import { NAV_CONSTANT } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib";
import MobileNav from "./MobileNav";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileDropdown } from "./UserProfileDropdown";

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 py-4 px-4 z-50 bg-white shadow-sm">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <Image
              src={NAV_CONSTANT.LOGOS.dark}
              className="h-10 w-auto"
              width={120}
              height={120}
              alt="Storefront Logo"
            />
          </Link>

          <div className="flex items-center ">
            <div className="hidden md:flex gap-x-10 lg:gap-x-16 text-sm text-black font-medium">
              {NAV_CONSTANT.NAV_ITEMS.map((item) => {
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (item.href.startsWith("#")) {
                    e.preventDefault();
                    const sectionId = item.href.substring(1);
                    if (pathname === "/") {
                      const section = document.getElementById(sectionId);
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                      }
                    } else {
                      router.push(`/#${sectionId}`);
                    }
                  } else if (item.href === "#pricing" || item.href === "/pricing") {
                    e.preventDefault();
                    if (pathname === "/") {
                      const pricingSection = document.getElementById("pricing");
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: "smooth" });
                      }
                    } else {
                      router.push("/#pricing");
                    }
                  }
                };
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClick}
                    className={cn(
                      "inline-block transition-colors",
                      pathname === item.href
                        ? "text-black font-semibold"
                        : "text-black hover:text-blue-600"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-x-10 lg:gap-x-16 shrink-0">
              {isAuthenticated && user ? (
                <div className="hidden md:flex items-center">
                  <span
                    className="w-px h-6 bg-black mx-8"
                    aria-hidden="true"
                  />
                  <UserProfileDropdown
                    user={{
                      firstname: user.firstname,
                      lastname: user.lastname,
                      email: user.email,
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="hidden md:flex items-center">
                    <span
                      className="w-px h-6 bg-black mx-8"
                      aria-hidden="true"
                    />
                    <Link
                      href="/signin"
                      className="text-sm font-medium text-black hover:text-blue-600 transition-colors"
                    >
                      Log in
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <Link href="/signup">
                      <Button
                        color="primary"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              )}

              <div className="-mr-1 md:hidden relative z-20">
                <Button
                  onPress={() => setOpen(!open)}
                  isIconOnly
                  size="sm"
                  className="bg-transparent border-none"
                >
                  {open ? (
                    <XMarkIcon className="text-black w-6 h-6" />
                  ) : (
                    <Bars3Icon className="text-black w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <MobileNav open={open} setOpen={setOpen} onLoginClick={() => router.push("/signin")} />
    </>
  );
};

export default Navbar;
