"use client";

import ProductList from "@/components/ProductList";
import { Suspense } from "react";

const ProductsPageContent = () => {
  return (
    <div className="">
      <ProductList params="products" />
    </div>
  );
};

const ProductsPage = () => {
  // Suspense is needed for useSearchParams() in ProductList
  return (
    <Suspense fallback={
      <div className="text-center py-8">
        <p className="text-gray-500">Loading products...</p>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
};

export default ProductsPage;
