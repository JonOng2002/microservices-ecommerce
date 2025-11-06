import { Suspense } from "react";
import CartPageClient from "./CartPageClient";

// Force dynamic rendering since CartPageClient uses useSearchParams
export const dynamic = 'force-dynamic';

const CartPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading cart...</p>
      </div>
    }>
      <CartPageClient />
    </Suspense>
  );
};

export default CartPage;
