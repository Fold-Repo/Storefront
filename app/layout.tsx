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
    template: "%s | Test Tube",
    default: SEO_TITLE,
  },
  description: SEO_DESCRIPTION,
  keywords: APP_KEYWORDS,
  authors: APP_AUTHORS,
  alternates: { canonical: SITE_URL },
  openGraph: APP_OPEN_GRAPH,
  twitter: APP_TWITTER,
  robots: APP_ROBOTS,
  manifest: "/favicon_io/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
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