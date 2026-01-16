import type { Metadata, Viewport } from "next";
import {
  SEO_TITLE, SEO_DESCRIPTION, SITE_URL, APP_KEYWORDS, APP_AUTHORS,
  APP_OPEN_GRAPH, APP_TWITTER, APP_ROBOTS, APP_THEME_COLOR
} from "@/constants";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | StoreFront",
    default: SEO_TITLE,
  },
  description: SEO_DESCRIPTION,
  keywords: APP_KEYWORDS,
  authors: APP_AUTHORS,
  alternates: { canonical: SITE_URL },
  openGraph: APP_OPEN_GRAPH,
  twitter: APP_TWITTER,
  robots: APP_ROBOTS,
  manifest: "/favicon.svg", // Using svg as manifest placeholder or remove if not needed
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans debug-screens"
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}