"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js";
// import { useAuth } from "@clerk/nextjs"; // Temporarily disabled for deployment testing
import { useEffect, useState } from "react";
import { CartItemsType, ShippingFormInputs } from "@repo/types";
import CheckoutForm from "./CheckoutForm";
import useCartStore from "@/stores/cartStore";

const stripe = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const fetchClientSecret = async (cart: CartItemsType, token: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
      {
        method: "POST",
        body: JSON.stringify({
          cart,
        }),
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`, // Temporarily disabled for deployment testing
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Checkout session error:", response.status, errorText);
      throw new Error(`Failed to create checkout session: ${response.status}`);
    }

    const json = await response.json();
    console.log("✅ Checkout session response:", json);
    
    if (!json.checkoutSessionClientSecret) {
      console.error("❌ No client secret in response:", json);
      throw new Error("No client secret returned from server");
    }
    
    return json.checkoutSessionClientSecret;
  } catch (error) {
    console.error("❌ fetchClientSecret error:", error);
    throw error;
  }
};

const StripePaymentForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const { cart } = useCartStore();
  // Authentication temporarily disabled for deployment testing
  // const [token, setToken] = useState<string | null>(null);
  // const { getToken } = useAuth();

  // useEffect(() => {
  //   getToken().then((token) => setToken(token));
  // }, []);

  // if (!token) {
  //   return <div className="">Loading...</div>;
  // }

  return (
    <CheckoutProvider
      stripe={stripe}
      options={{ fetchClientSecret: () => fetchClientSecret(cart, "dummy-token") }}
    >
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutProvider>
  );
};

export default StripePaymentForm;
