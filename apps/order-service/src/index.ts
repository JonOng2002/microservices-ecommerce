import Fastify from "fastify";
import Clerk from "@clerk/fastify";
import cors from "@fastify/cors";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const fastify = Fastify();

// Register CORS plugin BEFORE other plugins (handles preflight requests)
fastify.register(cors, {
  origin: [
    "http://localhost:3002", // Client frontend
    "http://localhost:3003", // Admin frontend
  ],
  credentials: true, // Allow credentials (cookies, authorization headers)
});

// Health endpoint BEFORE Clerk plugin (so it doesn't require auth)
fastify.get("/health", async (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Register Clerk plugin AFTER health endpoint
fastify.register(Clerk.clerkPlugin);

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({
    message: "Order service is authenticated!",
    userId: request.userId,
  });
});

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
    await fastify.listen({ port: 8001 });
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
