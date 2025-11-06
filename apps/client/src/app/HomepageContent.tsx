"use client";

import ProductList from "@/components/ProductList";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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

export default HomepageContent;

