import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

console.log("🔍 Stripe key starts with:", stripeSecretKey.substring(0, 7));

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-03-31.basil" as any,
});

export default stripe;
