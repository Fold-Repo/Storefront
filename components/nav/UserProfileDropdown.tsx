"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MenuDropdown } from "@/components/ui";
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/utils";

interface UserProfileDropdownProps {
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      authLogout();
      router.push("/");
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = () => {
    if (!user) return "U";

    const first = user.firstname?.charAt(0)?.toUpperCase() || "";
    const last = user.lastname?.charAt(0)?.toUpperCase() || "";

    // If we have both first and last name, return both initials
    if (first && last) {
      return `${first}${last}`;
    }

    // If we only have first name, use first two letters or first letter
    if (first && !last) {
      return user.firstname.length > 1
        ? `${first}${user.firstname.charAt(1).toUpperCase()}`
        : first;
    }

    // If we only have email, use first two letters of email
    if (user.email && !first && !last) {
      const emailInitials = user.email.substring(0, 2).toUpperCase();
      return emailInitials;
    }

    // Fallback
    return "U";
  };

  const fullName = `${user.firstname} ${user.lastname}`.trim() || user.email;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
        aria-label="User menu"
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm min-w-[2.5rem] min-h-[2.5rem] cursor-pointer">
          <span className="text-white leading-none">{getInitials()}</span>
        </div>
        <span className="hidden md:block text-sm font-medium text-neutral-700 cursor-pointer">
          {fullName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-neutral-200">
            <p className="text-sm font-semibold text-neutral-900">{fullName}</p>
            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                router.push("/dashboard");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <UserCircleIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                router.push("/dashboard?tab=settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Profile Settings</span>
            </button>

            <div className="border-t border-neutral-200 my-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer rounded-md mx-2 mb-1"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
