import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable middleware for subdomain routing
  experimental: {
    // Middleware is enabled by default in Next.js 13+
  },
  // Headers for Content Security Policy
  async headers() {
    return [
      {
        // Apply CSP to all pages (including editor)
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow Google Sign-In scripts and Firebase SDK
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.tailwindcss.com https://apis.google.com https://www.gstatic.com https://*.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              // Allow connections to Firebase services, Google Sign-In, and backend API
              "connect-src 'self' https://shorp-epos-backend.onrender.com https://api.dfoldlab.co.uk https://api.anthropic.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com wss://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://accounts.google.com",
              // Allow Google Sign-In and Firebase iframes
              "frame-src 'self' https://accounts.google.com https://*.googleapis.com https://*.firebaseapp.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
