"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { NAV_CONSTANT } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { logout } from "@/utils";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onLoginClick?: () => void;
};

const MobileNav: React.FC<Props> = ({ open, setOpen, onLoginClick }) => {
  const router = useRouter();
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      authLogout();
      setOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Lock body scroll when open and restore on close
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Focus first link when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => firstLinkRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${open
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <aside
        role="dialog"
        aria-modal={open}
        className={`fixed top-0 right-0 h-screen w-full sm:w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src={NAV_CONSTANT.LOGOS.dark}
              width={120}
              height={120}
              className="h-10 w-auto"
              alt="Storefront Logo"
            />
          </Link>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6 text-black" />
          </button>
        </div>

        <div className="px-6 py-6">
          <nav className="flex flex-col gap-4">
            {NAV_CONSTANT.NAV_ITEMS.map((item, i) => {
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                setOpen(false);
                if (item.href.startsWith("#")) {
                  e.preventDefault();
                  const sectionId = item.href.substring(1);
                  const section = document.getElementById(sectionId);
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push(`/#${sectionId}`);
                  }
                } else if (item.href === "#pricing" || item.href === "/pricing") {
                  e.preventDefault();
                  const pricingSection = document.getElementById("pricing");
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: "smooth" });
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
                  className="text-lg font-medium text-black"
                  ref={i === 0 ? firstLinkRef : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-3 bg-neutral-50 rounded-lg mb-2">
                  <p className="text-sm font-semibold text-neutral-900">
                    {user.firstname} {user.lastname}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm text-center font-medium text-black"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="text-sm text-center font-medium text-black w-full block"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="block text-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileNav;
