export type NavItemType = {
    label: string;
    href: string;
};

export type NavButtonType = {
    label: string;
    href: string;
    variant: "link" | "solid";
    radius?: "full" | "md" | "sm";
    showOnMobile: boolean;
};

export type LogoVariantsType = {
    light: string;
    dark: string;
};
