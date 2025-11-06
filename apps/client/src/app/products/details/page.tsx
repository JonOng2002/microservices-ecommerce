import { Suspense } from 'react';
import ProductDetailsContent from "./ProductDetailsContent";

// Route that handles product details via query parameters
// Usage: /products/details?id=123&color=red&size=M
export default function ProductDetailsPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <ProductDetailsContent />
    </Suspense>
  );
}
