'use client';

import { useSearchParams } from 'next/navigation';
import ProductPageClient from "./ProductPageClient";

// Content component that uses useSearchParams
function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const color = searchParams.get('color');
  const size = searchParams.get('size');

  if (!id) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600">Please provide a valid product ID.</p>
      </div>
    );
  }

  return (
    <ProductPageClient 
      id={id} 
      initialColor={color} 
      initialSize={size} 
    />
  );
}

export default ProductDetailsContent;

