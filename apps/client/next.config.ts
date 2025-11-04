import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for production builds
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
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
      {
        protocol: "https",
        hostname: "is458-products-img.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
    ],
  },
  // Trailing slash required for S3 static hosting
  trailingSlash: true,
};

export default nextConfig;
