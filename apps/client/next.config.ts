import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: 'standalone' for AWS Amplify compatibility
  // Amplify handles the build output internally for SSR
  
  // Explicitly expose server-side environment variables for runtime
  env: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_PRODUCT_SERVICE_URL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
    NEXT_PUBLIC_ORDER_SERVICE_URL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
    NEXT_PUBLIC_PAYMENT_SERVICE_URL: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  
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
