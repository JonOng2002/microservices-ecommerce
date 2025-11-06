import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: 'standalone' for AWS Amplify compatibility
  // Amplify handles the build output internally for SSR
  images: {
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
      {
        protocol: "https",
        hostname: "is458g1t2.jonongca.com",
      },
    ],
  },
};

export default nextConfig;
