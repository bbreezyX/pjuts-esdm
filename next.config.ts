import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

// Only initialize PWA in production to avoid HMR interference
const withPWA = withPWAInit({
  dest: "public",
  disable: isDev, // Completely disable in development
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: !isDev,
  fallbacks: {
    document: "/~offline",
  },
  // Prevent PWA from running any code in development
  buildExcludes: isDev ? [/./] : [],
});

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Development-specific optimizations
  ...(isDev && {
    // Longer page retention for faster navigation during dev
    onDemandEntries: {
      maxInactiveAge: 120 * 1000, // 2 minutes
      pagesBufferLength: 8,
    },
  }),

  // Compiler optimizations (production only)
  compiler: {
    removeConsole: !isDev ? { exclude: ["error", "warn"] } : false,
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: isDev ? 0 : 60 * 60 * 24 * 30, // No cache in dev, 30 days in prod
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Disable optimistic cache in development to see changes immediately
    optimisticClientCache: !isDev,
    // Tree-shake large packages
    optimizePackageImports: [
      "lucide-react",
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
  },

  // Security headers (apply to all environments)
  async headers() {
    // In development, use relaxed CSP for HMR/websockets
    const cspValue = isDev
      ? [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://unpkg.com",
          "connect-src 'self' ws: wss: https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.tile.openstreetmap.org https://*.openstreetmap.org https://tile.openstreetmap.org https://unpkg.com",
          "frame-ancestors 'none'",
        ].join("; ")
      : [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://unpkg.com",
          "connect-src 'self' https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.tile.openstreetmap.org https://*.openstreetmap.org https://tile.openstreetmap.org https://unpkg.com",
          "frame-ancestors 'none'",
        ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          ...(!isDev ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
          { key: "Content-Security-Policy", value: cspValue },
        ],
      },
      // Only aggressive caching in production
      ...(!isDev
        ? [
            {
              source: "/static/(.*)",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
            {
              source: "/_next/image(.*)",
              headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
            },
            {
              source: "/_next/static/(.*)",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
          ]
        : []),
    ];
  },

  // External packages for server
  serverExternalPackages: ["sharp", "@prisma/client"],

  // Webpack config only applies when NOT using Turbopack (i.e., production build)
  webpack: (config, { isServer, dev }) => {
    // Skip custom optimization in development (Turbopack handles it)
    if (dev) return config;

    // Production chunk optimization
    if (!isServer) {
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

// In development, skip PWA wrapper entirely for cleaner HMR
export default isDev ? nextConfig : withPWA(nextConfig);
