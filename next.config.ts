import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: "/~offline",
  },
});

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Turbopack configuration for faster, more reliable HMR
  turbopack: {
    // Resolve aliases help prevent module duplication
    resolveAlias: {
      // Ensure consistent React version across all imports
      react: "react",
      "react-dom": "react-dom",
    },
  },

  // Faster refresh in development
  reactStrictMode: true,

  // Development-specific: control page caching behavior
  onDemandEntries: isDev
    ? {
      // Keep pages in memory for longer (ms)
      maxInactiveAge: 60 * 1000,
      // Number of pages to keep in memory
      pagesBufferLength: 5,
    }
    : undefined,

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
          exclude: ["error", "warn"],
        }
        : false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Enable optimistic client cache for faster navigation
    optimisticClientCache: true,
    // Optimize bundle size by tree-shaking these packages
    optimizePackageImports: [
      "iconoir-react",
      "framer-motion",
      "date-fns",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-popover",
      "leaflet",
    ],
    // Partial prerendering for faster page loads
    ppr: false, // Enable when stable
  },

  // Enhanced Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self)",
          },
          // XSS Protection (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // HSTS - Force HTTPS (enable in production)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com", // Required for Next.js and Leaflet CDN
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://unpkg.com",
              "connect-src 'self' https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.tile.openstreetmap.org https://*.openstreetmap.org https://tile.openstreetmap.org https://unpkg.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache images
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      // Cache JS/CSS chunks
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Reduce bundle size by marking external packages
  serverExternalPackages: ["sharp", "@prisma/client"],

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize chunks
    if (!isServer) {
      // Get existing cacheGroups safely
      const existingSplitChunks = config.optimization?.splitChunks;
      const existingCacheGroups =
        typeof existingSplitChunks === "object" &&
          existingSplitChunks !== null &&
          "cacheGroups" in existingSplitChunks
          ? (existingSplitChunks.cacheGroups as Record<string, unknown>)
          : {};

      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...existingSplitChunks,
          cacheGroups: {
            ...existingCacheGroups,
            // Separate large libraries into their own chunks
            leaflet: {
              test: /[\\/]node_modules[\\/](leaflet|leaflet\.markercluster)[\\/]/,
              name: "leaflet",
              chunks: "all",
              priority: 30,
            },
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              name: "recharts",
              chunks: "all",
              priority: 30,
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: "radix",
              chunks: "all",
              priority: 20,
            },
          },
        },
      };
    }

    return config;
  },
};

export default withPWA(nextConfig);
