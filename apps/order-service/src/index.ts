import Fastify from "fastify";
import cors from "@fastify/cors";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const fastify = Fastify();

// Register CORS plugin BEFORE other plugins (handles preflight requests)
fastify.register(cors, {
  origin: [
    process.env.CLIENT_URL || "http://localhost:3002", // Client frontend
    process.env.ADMIN_URL || "http://localhost:3003", // Admin frontend
    "https://main.d18wbnrtlaqqva.amplifyapp.com", // Amplify client domain
    "https://main.d21ddnl9n8aqva.amplifyapp.com", // Amplify admin domain
    "https://shop.is458g1t2.jonongca.com", // Custom client domain
    "https://admin.is458g1t2.jonongca.com", // Custom admin domain
  ],
  credentials: true, // Allow credentials (cookies, authorization headers)
});

// Health endpoint
fastify.get("/health", async (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Clerk plugin removed - routes are public (auth handled by passing userId in query params)
// If you need auth later, uncomment and configure Clerk keys:
// fastify.register(Clerk.clerkPlugin);

fastify.register(orderRoute);

const start = async () => {
  try {
    await Promise.all([
      connectOrderDB(),
      producer.connect(),
      consumer.connect(),
    ]);
    console.log("Order service: Database and Kafka connected");
    
    // Start server first, then subscribe to topics (non-blocking)
    await fastify.listen({ port: 8001, host: "0.0.0.0" });
    console.log("Order service is running on port 8001");
    
    // Subscribe to topics (if this fails, service still runs)
    try {
      await runKafkaSubscriptions();
    } catch (subError) {
      console.error("Warning: Kafka subscription failed, but service will continue:", subError);
    }
  } catch (err) {
    console.error("Order service startup error:", err);
    process.exit(1);
  }
};
start();
