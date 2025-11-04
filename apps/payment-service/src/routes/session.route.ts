import { Hono } from "hono";
import stripe from "../utils/stripe";
import { shouldBeUser } from "../middleware/authMiddleware";
import { CartItemsType } from "@repo/types";
import { getStripeProductPrice } from "../utils/stripeProduct";
import { producer } from "../utils/kafka";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId");

  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const unitAmount = await getStripeProductPrice(item.id);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmount as number,
        },
        quantity: item.quantity,
      };
    })
  );

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId,
      mode: "payment",
      ui_mode: "custom",
      return_url:
        "http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}",
      metadata: {
        cartItems: JSON.stringify(cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: (item as any).selectedSize || "m" // Include selected size for inventory updates
        })))
      }
    });

    console.log("✅ Checkout session created:", session.id);

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    return c.json({ error });
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["line_items"],
    }
  );

  // If payment is completed, publish event to create order
  if (session.payment_status === "paid" && session.status === "complete") {
    const lineItems = session.line_items?.data || [];
    const cartItems = session.metadata?.cartItems ? JSON.parse(session.metadata.cartItems) : [];
    
    try {
      await producer.send("payment.successful", {
        value: {
          userId: session.client_reference_id,
          email: session.customer_details?.email,
          amount: session.amount_total,
          status: "success",
          products: cartItems.length > 0 
            ? cartItems.map((item: any) => ({
                id: item.id, // Include product ID for inventory updates
                name: item.name,
                quantity: item.quantity,
                price: item.price * 100, // Convert to cents
                size: item.size || "m", // Include size for inventory updates
              }))
            : lineItems.map((item) => ({
                name: item.description,
                quantity: item.quantity,
                price: item.price?.unit_amount,
              })),
        },
      });
      console.log("✅ Order event published for session:", session_id);
    } catch (error) {
      console.error("❌ Failed to publish order event:", error);
    }
  }

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
  });
});

export default sessionRoute;
