import Link from "next/link";

// Force dynamic rendering since this page uses searchParams
export const dynamic = 'force-dynamic';

const ReturnPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }> | undefined;
}) => {
  const session_id = (await searchParams)?.session_id;

  if (!session_id) {
    return <div>No session id found!</div>;
  }

  // Wait a bit for order to be created via Kafka event
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/${session_id}`
  );
  const data = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Complete!</h1>
        <p className="text-gray-600 mb-2">
          Thank you for your purchase
        </p>
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium capitalize">Payment Status: {data.paymentStatus}</span>
        </div>

        {/* Order Confirmation */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Order Status</p>
          <p className="text-lg font-semibold text-gray-800 capitalize">{data.status}</p>
        </div>

        {/* Action Button */}
        <Link 
          href="/orders"
          className="inline-flex items-center justify-center w-full bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          View My Orders
        </Link>

        {/* Continue Shopping Link */}
        <Link 
          href="/"
          className="inline-block mt-4 text-gray-600 hover:text-gray-800 text-sm font-medium underline"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default ReturnPage;
