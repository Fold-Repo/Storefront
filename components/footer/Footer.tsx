import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { LinkGroup, NavLink } from "../footer/FooterLink";

const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#E0E0E066] py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8">
          {/* Column 1: Brand */}
          <div>
            <h1 className="text-black font-extrabold text-2xl mb-4">
              Storefront
            </h1>
            <p className="text-base font-normal text-black/70 sm:max-w-xs">
              Build beautiful, fully-functional online stores with our AI-powered wizard. 
              No coding required.
            </p>
          </div>

          {/* Column 2: Product header only */}
          <div>
            <LinkGroup header="Product">
              <NavLink link="/#" label="Features" />
              <NavLink link="/#" label="Pricing" />
              <NavLink link="/#" label="Features" />
            </LinkGroup>
          </div>

          {/* Column 3: Storefront header only */}
          <div>
            <LinkGroup header="Storefront">
              <NavLink link="/#" label="How It Works" />
              <NavLink link="/#" label="Templates" />
              <NavLink link="/#" label="Success Stories" />
            </LinkGroup>
          </div>

          {/* Column 4: Legal header only */}
          <div>
            <LinkGroup header="Legal">
              <NavLink link="/#" label="Privacy Policy" />
              <NavLink link="/#" label="Terms of Service" />
              <NavLink link="/#" label="Contact Us" />
            </LinkGroup>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-neutral-600">
              © 2025 Storefront. All rights reserved.
            </div>

            <div className="flex items-center gap-4">
              <a href="#" aria-label="X (Twitter)" className="text-black ">
                <FaXTwitter className="size-8" />
              </a>

              <a href="#" aria-label="Facebook" className="text-blue-600">
                <FaFacebook className="size-8" />
              </a>

              <a href="#" aria-label="Instagram" className="text-pink-500 ">
                <FaSquareInstagram className="size-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
