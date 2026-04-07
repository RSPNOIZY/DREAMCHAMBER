/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@noizy/ui", "@noizy/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.noizy.ai" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@heroicons/react"],
  },
};

module.exports = nextConfig;
