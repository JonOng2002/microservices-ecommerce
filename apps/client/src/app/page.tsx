import ProductList from "@/components/ProductList";
import Image from "next/image";
import { Suspense } from "react";
import HomepageContent from "./HomepageContent";

// Force dynamic rendering since HomepageContent uses useSearchParams
export const dynamic = 'force-dynamic';

const Homepage = () => {
  // Suspense is needed for useSearchParams() in HomepageContent
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
