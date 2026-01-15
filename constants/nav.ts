import { NavItemType, NavButtonType, LogoVariantsType } from "@/types";
import { LOGO } from "./logo";

export const NAV_ITEMS: NavItemType[] = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },

];

export const NAV_BUTTONS: NavButtonType[] = [
    {
        label: "Log in",
        href: "/signin",
        variant: "link",
        showOnMobile: false,
    },
    {
        label: "Get Started",
        href: "/signup",
        variant: "solid",
        radius: "full",
        showOnMobile: false,
    },
];

export const LOGOS: LogoVariantsType = {
    light: LOGO.white,
    dark: LOGO.black,
};

export const NAV_CONSTANT = {
    NAV_ITEMS,
    NAV_BUTTONS,
    LOGOS,
};
