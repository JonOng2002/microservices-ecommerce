"use client";

import ProductList from "@/components/ProductList";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const HomepageContent = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;

  return (
    <div className="">
      <div className="relative aspect-[3/1] mb-12">
        <Image src="/featured.png" alt="Featured Product" fill />
      </div>
      <ProductList category={category} params="homepage"/>
    </div>
  );
};

const Homepage = () => {
  // Suspense is still needed for useSearchParams() in HomepageContent
  return (
    <Suspense fallback={
      <div className="">
        <div className="relative aspect-[3/1] mb-12">
          <Image src="/featured.png" alt="Featured Product" fill />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <HomepageContent />
    </Suspense>
  );
};

export default Homepage;
