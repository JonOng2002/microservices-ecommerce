import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Disabled for local dev - conflicts with dynamic routes using auth()
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
