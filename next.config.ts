import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/webp"],
    // images uploaded from the admin panel live in Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "9mb" },
  },
  // landing pages listed in the original sitemap whose content was never archived
  async redirects() {
    return [
      { source: "/tenerife", destination: "/tenerifa", permanent: true },
      { source: "/fr/tenerife", destination: "/fr/teneriffe", permanent: true },
      { source: "/barcelona-tickets", destination: "/barcelona", permanent: true },
      { source: "/fr/barcelona-tickets", destination: "/fr/barcelone", permanent: true },
      { source: "/es/barcelona-tickets", destination: "/es/barcelona", permanent: true },
    ];
  },
};

export default nextConfig;
