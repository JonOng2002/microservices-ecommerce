import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import inventoryRouter from "./routes/inventory.route";
import uploadRouter from "./routes/upload.route";
import { consumer, producer } from "./utils/kafka.js";
import { getProducts, getProduct } from "./controllers/product.controller.js";
import { getCategories } from "./controllers/category.controller.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  })
);

app.use(express.json());

// Health endpoint (completely public, no auth)
app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Public GET routes (no auth needed to view products/categories)
app.get("/products", getProducts);
app.get("/products/:id", getProduct);
app.get("/categories", getCategories);

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

console.log("🔍 DEBUG - Keys loaded:");
console.log("Publishable Key:", clerkPublishableKey?.substring(0, 15) + "..." + clerkPublishableKey?.slice(-10));
console.log("Secret Key:", clerkSecretKey?.substring(0, 15) + "..." + clerkSecretKey?.slice(-10));


if (!clerkPublishableKey || !clerkSecretKey) {
  console.error("⚠️  WARNING: Clerk keys missing!");
  console.error("CLERK_PUBLISHABLE_KEY:", clerkPublishableKey ? "Set" : "Missing");
  console.error("CLERK_SECRET_KEY:", clerkSecretKey ? "Set" : "Missing");
}

// Clerk middleware ONLY for routes registered after this point
if (clerkPublishableKey && clerkSecretKey) {
  app.use(clerkMiddleware({
    publishableKey: clerkPublishableKey,
    secretKey: clerkSecretKey,
    // Ensure Clerk reads from Authorization header
    // By default, it should check both cookies and Authorization header
  }));
} else {
  console.warn("⚠️  Clerk middleware NOT registered - keys missing!");
}

app.get("/test", shouldBeUser, (req, res) => {
  res.json({ message: "Product service authenticated", userId: req.userId });
});

// Protected routes (POST, PUT, DELETE) - require authentication
app.use("/upload", uploadRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/inventory", inventoryRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    await Promise.all([producer.connect(), consumer.connect()]);
    console.log("Product service: Kafka connected");
    app.listen(8000, () => {
      console.log("Product service is running on 8000");
      console.log("Clerk keys status:", {
        publishableKey: clerkPublishableKey ? "✓ Set" : "✗ Missing",
        secretKey: clerkSecretKey ? "✓ Set" : "✗ Missing",
      });
    });
  } catch (error) {
    console.error("Product service startup error:", error);
    process.exit(1);
  }
};

start();