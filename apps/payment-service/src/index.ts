import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import webhookRoute from "./routes/webhooks.route.js";

const app = new Hono();

// CORS FIRST - Must handle OPTIONS preflight requests before any other middleware
app.use("*", cors({ 
  origin: [
    process.env.CLIENT_URL || "http://localhost:3002",
    process.env.ADMIN_URL || "http://localhost:3003"
  ],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}));

// Health endpoint (doesn't require auth)
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Clerk middleware - applied globally but individual routes use shouldBeUser to enforce
app.use("*", clerkMiddleware());

app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);

// app.post("/create-stripe-product", async (c) => {
//   const res = await stripe.products.create({
//     id: "123",
//     name: "Test Product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });

//   return c.json(res);
// });

// app.get("/stripe-product-price", async (c) => {
//   const res = await stripe.prices.list({
//     product: "123",
//   });

//   return c.json(res);
// });

const start = async () => {
  try {
    await Promise.all([producer.connect(), consumer.connect()]);
    console.log("Kafka connected for payment service");
    
    // Start server first, then subscribe to topics (non-blocking)
    serve(
      {
        fetch: app.fetch,
        port: 8002,
      },
      (info) => {
        console.log(`Payment service is running on port 8002`);
      }
    );
    
    // Subscribe to topics (if this fails, service still runs)
    try {
      await runKafkaSubscriptions();
    } catch (subError) {
      console.error("Warning: Kafka subscription failed, but service will continue:", subError);
    }
  } catch (error) {
    console.error("Payment service startup error:", error);
    process.exit(1);
  }
};
start();
