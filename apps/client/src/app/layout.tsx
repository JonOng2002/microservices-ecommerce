import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
// import { ClerkProvider } from "@clerk/nextjs"; // Temporarily disabled for deployment testing

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Men'sWears - Best Clothes",
  description: "Men'sWears is the best place to find the best clothes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Authentication temporarily disabled for deployment testing
  // const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // if (!publishableKey) {
  //   throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable");
  // }

  return (
    // <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
            <Navbar />
            {children}
            <Footer />
          </div>
          <ToastContainer position="bottom-right" />
        </body>
      </html>
    // </ClerkProvider>
  );
}
